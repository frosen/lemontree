// TerrainCtrlr.ts
// 地形管理器：
// 控制tiledmap
// lly 2017.12.18

const {ccclass, property} = cc._decorator;

/** 一个瓦片的标准长度 */
const TileLength: number = 32;

/** 碰撞类型 */
export enum CollisionType {
    /** 无碰撞 */
    none = 0,
    /** 碰撞了平台，可下跳 */
    platform = 1,
    /** 碰撞了斜面，类似实体，根据dir从一边倾斜，优先级高于平台，因此不考虑倾斜面紧挨着平台的情况 */
    slope = 2,
    /** 碰撞了实体 */
    entity = 3,
}

export class TileAttris {

}

export class SlopeAttris extends TileAttris {
    dir: number = 0;
    x: number = 0;
    y: number = 0;
}

@ccclass
export class TerrainCtrlr extends cc.Component {

    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;

    /** 地图块数 */
    tileNumSize: cc.Size = null;
    /** 地形尺寸 */
    terrainSize: cc.Size = null;
    /** 碰撞检测层 */
    collidableLayer: cc.TiledLayer = null;

    /** 碰撞缓存 不但可以加速，更可以改变某处的碰撞类型*/
    collisionCache: {} = {}

    /** 碰撞属性的缓存，每一项也是一个object，其属性取于tile */
    collisionAttriCache: {[key: number]: TileAttris;} = {}

    onLoad() {
        // init logic
        this.tileNumSize = this.tiledMap.getMapSize();
        this.terrainSize = new cc.Size(this.tileNumSize.width * TileLength, this.tileNumSize.height * TileLength - 0.001);
        this.collidableLayer = this.tiledMap.getLayer("collision");
        
        this.collidableLayer.enabled = false;
    }

    /**
     * 根据位置，获取图块索引值
     */
    _getTileIndex(x: number, y: number): {tileX: number, tileY: number} {
        let tileX = Math.floor(x / TileLength);
        let tileY = Math.floor((this.terrainSize.height - y) / TileLength); // tiledmap与creator的y轴相反
        return {
            tileX: tileX, 
            tileY: tileY
        }
    }

    /**
     * 根据图块索引值，获取缓存的key
     */
    _getCacheKey(tileX: number, tileY: number): number {
        return tileX * 1000 + tileY;
    }

    /**
     * 检测当前creator坐标在当前tiledMap中是否为一个碰撞区块
     * @param x: x坐标
     * @param y: y坐标
     * @return 碰撞类型
     */
    checkCollideAt(x: number, y: number): CollisionType {   
        // 计算在哪个瓦片上
        let {tileX, tileY} = this._getTileIndex(x, y);

        // 首先使用缓存
        let cacheKey = this._getCacheKey(tileX, tileY);
        let cache = this.collisionCache[cacheKey];
        if (cache) return cache;

        if (tileX < 0 || this.tileNumSize.width <= tileX || tileY < 0 || this.tileNumSize.height <= tileY) {
            return CollisionType.none; // 超出范围无碰撞
        }

        let gid = this.collidableLayer.getTileGIDAt(tileX, tileY);
        if (!gid) return CollisionType.none; // 没有瓦片

        let properties = this.tiledMap.getPropertiesForGID(gid);
        if (!properties) return CollisionType.none; // null 没有属性

        let collidable: CollisionType = parseInt(properties.collidable) as CollisionType;

        this.collisionCache[cacheKey] = collidable;

        // 获取图块属性       
        let attris = null;;
        switch (collidable) {
            case CollisionType.slope:
                attris = new SlopeAttris()

                let dir: number = parseInt(properties.dir);
                attris.dir = dir;

                // 另需要保存一个位置值（就是左下或者右下的尖角位置），便于计算
                let x = tileX;
                let y = tileY;
                if (dir > 0) x += 1;
                y = this.tileNumSize.height - y;
                attris.x = x * TileLength;
                attris.y = y * TileLength; 
                break;
        }
        this.collisionAttriCache[cacheKey] = attris;

        return collidable;
    }

    /**
     * 获取图块属性，不会检测attri是否存在，需要在外部保证
     * @param x: x坐标
     * @param y: y坐标
     * @return 属性 object
     */
    getTileAttris(x: number, y: number): TileAttris {
        let {tileX, tileY} = this._getTileIndex(x, y);
        let cacheKey = this._getCacheKey(tileX, tileY);
        let attri = this.collisionAttriCache[cacheKey]; // attri一定会有的；
        return attri;
    }

    /**
     * 检测一条竖线上是否有碰撞；to必须大于from；
     * @param x: x坐标
     * @param fromY: y坐标
     * @param toY: y坐标
     * @return 0是无碰撞，1是碰撞块
     */
    checkCollideInVerticalLine(x: number, fromY: number, toY: number): CollisionType {
        let collisionType: CollisionType = CollisionType.none;
        let y = fromY;
        while (true) {
            let t: CollisionType = this.checkCollideAt(x, y);          
            if (t > collisionType) collisionType = t; // 数值大意味着优先级高

            y += TileLength;
            if (y >= toY) break;
        }

        // 还要检测下最后一个值
        let t: CollisionType = this.checkCollideAt(x, toY);           
        if (t > collisionType) collisionType = t;
        
        return collisionType;
    }

    /**
     * 检测一条线上是否有碰撞；to必须大于from；
     * 同时检测是否在边缘，边缘在左返回-1，在右返回1，没有返回0
     * @param fromX: x坐标
     * @param toX: x坐标
     * @param y: y坐标
     * @return {type: CollisionType, edgeDir: number}
     */
    checkCollideInHorizontalLine(fromX: number, toX: number, y: number): {type: CollisionType, edgeDir: number} {
        let collisionType: CollisionType = CollisionType.none;
        let x = fromX;
        let edgeLeft = null;
        let edgeRight = null;
        while (true) {
            let t: CollisionType = this.checkCollideAt(x, y);
            if (t > collisionType) collisionType = t;

            if (edgeLeft == null) edgeLeft = t;

            x += TileLength;
            if (x >= toX) break;
        }

        let t: CollisionType = this.checkCollideAt(toX, y);           
        if (t > collisionType) collisionType = t;
        edgeRight = t;

        let edgeDir: number = 0;
        if (edgeLeft == CollisionType.none && edgeRight != CollisionType.none) {
            edgeDir = -1;
        } else if (edgeLeft != CollisionType.none && edgeRight == CollisionType.none) {
            edgeDir = 1;
        }

        return {
            type: collisionType,
            edgeDir: edgeDir
        }
    }

    /**
     * 获取某一点的x或者y到此处tile的边的距离
     * @param pos: 坐标的x或者y
     * @param dir: >0 为此点到左或下的距离，<0 为到右或上的距离
     * @return 到左或下返回正数，右或上返回负数
     */
    getDistanceToTileSide(pos: number, dir: number): number {
        if (dir > 0) return pos % TileLength;
        else return pos % TileLength - TileLength;
    }

    getSlopeAttris(x: number, fromY: number, toY: number): SlopeAttris {
        let attris: SlopeAttris = null;
        let y = fromY;
        while (true) {
            let t: CollisionType = this.checkCollideAt(x, y);          
            if (t == CollisionType.slope) {
                attris = this.getTileAttris(x, y) as SlopeAttris;
                break;
            }

            y += TileLength;
            if (y >= toY) break;
        }

        // 还要检测下最后一个值
        if (attris == null) {
            let t: CollisionType = this.checkCollideAt(x, toY);          
            if (t == CollisionType.slope) {
                attris = this.getTileAttris(x, toY) as SlopeAttris;
            }
        }

        return attris;
    }

    /**
     * 获取由于斜面导致的y轴偏移量
     * @param x: x坐标
     * @param fromY: y坐标
     * @param toY: y坐标 因为是从上往下找，所以toY一定要小于fromY
     * @param dir: 碰撞对象的方向
     * @returns 偏移量 number
     */
    getSlopeOffset(x: number, fromY: number, toY: number): number {
        let attris: SlopeAttris = null;
        let y = fromY;
        while (true) {
            let t: CollisionType = this.checkCollideAt(x, y);          
            if (t == CollisionType.slope) {
                attris = this.getTileAttris(x, y) as SlopeAttris;
                break;
            }

            y += TileLength;
            if (y >= toY) break;
        }

        // 还要检测下最后一个值
        if (attris == null) {
            let t: CollisionType = this.checkCollideAt(x, toY);          
            if (t == CollisionType.slope) {
                attris = this.getTileAttris(x, toY) as SlopeAttris;
            }
        }

        if (attris == null) {
            cc.log(x, fromY, toY);
            cc.error("wrong slope attris");
            return 0;
        }
        
        // 计算需要的偏移量
        let dir = attris.dir;
        let dis = Math.abs(attris.x - x);
        let realY = attris.y + dis;
        let offset = realY - toY;
        
        return offset;
    }
}
