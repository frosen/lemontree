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
    /** 碰撞了实体 */
    entity = 2,
}

@ccclass
export class TerrainCtrlr extends cc.Component {

    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;

    /** 地形尺寸 */
    terrainSize: cc.Size = null;
    /** 碰撞检测层 */
    collidableLayer: cc.TiledLayer = null;

    /** 碰撞缓存 不但可以加速，更可以改变某处的碰撞类型*/
    collisionCache: {} = {}

    onLoad() {
        // init logic
        let tileNumSize: cc.Size = this.tiledMap.getMapSize();
        this.terrainSize = new cc.Size(tileNumSize.width * TileLength, tileNumSize.height * TileLength);
        this.collidableLayer = this.tiledMap.getLayer("collision");
        
        this.collidableLayer.enabled = false;
    }

    /**
     * 检测当前creator坐标在当前tiledMap中是否为一个碰撞区块
     * @param x: x坐标
     * @param y: y坐标
     * @return 碰撞类型
     */
    checkCollideAt(x: number, y: number): CollisionType {
        
        let tileX = Math.floor(x / TileLength);
        let tileY = Math.floor((this.terrainSize.height - y - 0.001) / TileLength); // tiledmap与creator的y轴相反

        // 首先使用缓存
        let cacheKey = tileX * 100000 + tileY;
        let cache = this.collisionCache[cacheKey]
        if (cache) return cache;

        if (tileX < 0 || this.terrainSize.width - 1 < tileX || tileY < 0 || this.terrainSize.height - 1 < tileY) {
            return CollisionType.none; // 超出范围无碰撞
        }

        let gid = this.collidableLayer.getTileGIDAt(tileX, tileY);
        if (!gid) return CollisionType.none; // 没有瓦片

        let properties = this.tiledMap.getPropertiesForGID(gid);
        if (!properties) return CollisionType.none; // null 没有属性

        let collidable: CollisionType = parseInt(properties.collidable) as CollisionType;

        this.collisionCache[cacheKey] = collidable;
        
        return collidable;
    }

    /**
     * 检测一条线上是否有碰撞；to必须大于from；不检测type2
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
            if (t == CollisionType.entity) {
                collisionType = t;
                break;
            }

            if (y > toY - 1) break;

            y += TileLength;
            if (y > toY) y = toY;
        }
        
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

            if (x - toX > - 1) {
                edgeRight = t;
                break;
            }

            x += TileLength;
            if (x - toX > 0) x = toX;
        }

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
}
