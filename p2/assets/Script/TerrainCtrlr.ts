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
    /** 碰撞了斜面，类似实体，
     * 根据dir从一边倾斜，
     * 只考虑实面挨着足够长（大于obj的宽度）的实体，斜面挨着足够长的none的情况，其他情况可能会有问题 
    */
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
        
        this.collidableLayer.node.active = false;
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
                y = this.tileNumSize.height - y - 1;
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
     * 检测一条线上是否有碰撞和是否有边缘；to必须大于from；
     * 同时检测是否在边缘，沿着运动方向从前向后检索，最后一个边缘块视为其边缘
     * @param fromX: x坐标
     * @param toX: x坐标
     * @param y: y坐标
     * @param dir: 对象运动朝向
     * @return {type: CollisionType, edgeType: CollisionType}
     */
    checkCollideInHorizontalLine(fromX: number, toX: number, y: number, dir: number): 
        {type: CollisionType, edgeType: CollisionType} {
        let collisionType: CollisionType = CollisionType.none;
        let x = fromX;

        let edgeList = [];

        while (true) {
            let t: CollisionType = this.checkCollideAt(x, y);
            edgeList.push(t);
            if (t > collisionType) collisionType = t;

            x += TileLength;
            if (x >= toX) break;
        }

        let t: CollisionType = this.checkCollideAt(toX, y); 
        edgeList.push(t);          
        if (t > collisionType) collisionType = t;

        let edgeType: CollisionType = null;
        if (dir != 0) {
            if (dir > 0) edgeList = edgeList.reverse();
            for (const edge of edgeList) {
                if (edge == CollisionType.none || edge == CollisionType.slope) {
                    edgeType = edge;
                } else {
                    break;
                }
            }
        }

        return {
            type: collisionType,
            edgeType: edgeType
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

    /**
     * 获取由于斜面导致的y轴偏移量
     * @param x number
     * @param y number
     * @param checkDir number 需要检测的方向
     * @returns 偏移量 number 正数为向下偏移
     */
    getSlopeOffset(x: number, y: number, checkDir: number): number {
        let t: CollisionType = this.checkCollideAt(x, y);
        if (t != CollisionType.slope) return null;

        let attris = this.getTileAttris(x, y) as SlopeAttris;
        let dir = attris.dir;
        if (dir != checkDir) return null;

        let dis = Math.abs(attris.x - x);
        let slopeY = attris.y + dis;
        let offset = slopeY - y;
        return offset;
    }
}
