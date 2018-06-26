// TerrainCtrlr.ts
// 地形管理器：
// 控制tiledmap
// lly 2017.12.18

const {ccclass, property} = cc._decorator;

/** 一个瓦片的标准长度 */
const TileLength: number = 32;

const ForcedMoveX: number = 2;
const ForcedMoveY: number = 10;

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

enum ForcedMoveType {
    left,
    right,
    up,
}

const GidTypeList = [
    undefined,

    CollisionType.platform,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,

    CollisionType.entity,
    CollisionType.entity,
    CollisionType.slope, 
    CollisionType.slope,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity
]

@ccclass
export class TerrainCtrlr extends cc.Component {

    /** 地图块数 */
    tileNumSize: cc.Size = cc.Size.ZERO;
    /** 地形尺寸 */
    terrainSize: cc.Size = cc.Size.ZERO;
    /** 碰撞数据 */
    collisionData: number[][] = null;

    setTerrainData(clsnData: number[][]) {
        this.collisionData = clsnData;
        this.tileNumSize = cc.size(clsnData[0].length, clsnData.length);
        this.terrainSize = new cc.Size(this.tileNumSize.width * TileLength, this.tileNumSize.height * TileLength - 0.001);
        this.node.setContentSize(this.terrainSize);
    }

    /**
     * 得到一个块的最下的中点
     */
    getPosFromTilePos(x: number, y: number, tileNumHeight: number = null): cc.Vec2 {
        let h = tileNumHeight ? tileNumHeight * TileLength : this.terrainSize.height
        return cc.v2(x * TileLength + TileLength * 0.5, h - y * TileLength - TileLength);
    }

    /**
     * 根据位置，获取图块索引值
     */
    _getTileIndex(x: number, y: number): {tileX: number, tileY: number} {
        let tileX = Math.floor(x / TileLength);
        let tileY = Math.floor((this.terrainSize.height - y) / TileLength); // tiledmap与creator的y轴相反
        return {tileX, tileY};
    }

    /**
     * 获取瓦片id
     */
    _getGid(tileX: number, tileY: number): number {
        if (tileX < 0 || this.tileNumSize.width <= tileX || tileY < 0 || this.tileNumSize.height <= tileY) {
            return null; // 超出范围无碰撞
        }

        if (!this.collisionData) return;

        let gid = this.collisionData[tileY][tileX];
        return gid;
    }

    // id 转 数据========================================================

    

    /**
     * 根据瓦片id，转换成所代表的碰撞类型
     */
    _getTypeFromGid(gid: number): CollisionType {
        return GidTypeList[gid] || CollisionType.none;
    }

    _getSlopeDir(gid: number): number {
        switch (gid) {
            case 11: return 1;
            case 12: return -1;              
            default: return null;
        }
    }

    /**
     * 获取强制移动速度方向
     * @returns ForcedMoveType
     */
    _getForcedMoveDir(gid: number): ForcedMoveType {
        switch (gid) {
            case 13: return ForcedMoveType.right;
            case 14: return ForcedMoveType.left; 
            case 15: return ForcedMoveType.up;             
            default: return null;
        }
    }

    /**
     * 如果是门，则获得门的id（包含其属性），否则获得空
     */
    _getGateGid(gid: number): number {
        let key = Math.floor(gid / 100000);
        if (key != 1) return null;

        return gid;
    }

    // ==================================================================

    /**
     * 检测当前creator坐标在当前tiledMap中是否为一个碰撞区块
     * @param x: x坐标
     * @param y: y坐标
     * @return 碰撞类型
     */
    checkCollideAt(x: number, y: number): CollisionType {
        let {tileX, tileY} = this._getTileIndex(x, y); 
        let gid = this._getGid(tileX, tileY);
        if (!gid) return CollisionType.none;
        return this._getTypeFromGid(gid);
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
     * @return {type: CollisionType, edgeLeft: CollisionType, edgeRight: CollisionType}
     */
    checkCollideInHorizontalLine(fromX: number, toX: number, y: number): 
        {type: CollisionType, edgeLeft: CollisionType, edgeRight: CollisionType} {
        let type: CollisionType = CollisionType.none;
        let x = fromX;

        let edgeLeft: CollisionType = null;
        let edgeRight: CollisionType = null;
        let leftBegin: boolean = true;
        let rightBegin: boolean = false;

        while (true) {
            let t: CollisionType = this.checkCollideAt(x, y);
            if (t > type) type = t;

            if (leftBegin) {
                if (t == CollisionType.none || t == CollisionType.slope) {
                    edgeLeft = t;
                } else {
                    leftBegin = false;
                }
            } else if (!rightBegin) {
                if (t == CollisionType.none || t == CollisionType.slope) {
                    edgeRight = t;
                    rightBegin = true;
                }  
            }

            x += TileLength;
            if (x >= toX) break;
        }

        let t: CollisionType = this.checkCollideAt(toX, y);          
        if (t > type) type = t;
        
        // 如果至此leftBegin都没有结束的话，则是一种特殊情况
        if (leftBegin) {
            edgeLeft = this.checkCollideAt(fromX, y);
            edgeRight = t;
        } else if (!rightBegin && (t == CollisionType.none || t == CollisionType.slope)) {
            edgeRight = t;
        }

        return {type, edgeLeft, edgeRight};
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
     * @returns 偏移量 number 正数为向下偏移 为空表示不是斜面
     */
    getSlopeOffset(x: number, y: number, checkDir: number): number {
        let {tileX, tileY} = this._getTileIndex(x, y); 
        let gid = this._getGid(tileX, tileY);
        if (!gid) return null;

        let dir = this._getSlopeDir(gid);
        if (dir != checkDir) return null;

        let _x = tileX;
        let _y = tileY;
        if (dir > 0) _x += 1;
        _y = this.tileNumSize.height - _y - 1;
        _x *= TileLength;
        _y *= TileLength; 

        let dis = Math.abs(_x - x);
        let slopeY = _y + dis;
        let offset = slopeY - y;
        return offset;
    }

    /**
     * 获取强制移动的各方向速率
     */
    getForcedMoveVel(x: number, y: number): {vX: number, vY: number} {
        let {tileX, tileY} = this._getTileIndex(x, y); 
        let gid = this._getGid(tileX, tileY);
        if (!gid) return {vX: 0, vY: 0};

        let dir = this._getForcedMoveDir(gid);
        if (dir == null) return {vX: 0, vY: 0};

        switch (dir) {
            case ForcedMoveType.left: return {vX: ForcedMoveX * -1, vY: 0};
            case ForcedMoveType.right: return {vX: ForcedMoveX , vY: 0};
            case ForcedMoveType.up: return {vX: 0, vY: ForcedMoveY};
            default: return {vX: 0, vY: 0};     
        }
    }

    getGateData(x: number, y: number): number {
        let {tileX, tileY} = this._getTileIndex(x, y); 
        let gid = this._getGid(tileX, tileY);
        if (!gid) return;

        return this._getGateGid(gid);
    }
}
