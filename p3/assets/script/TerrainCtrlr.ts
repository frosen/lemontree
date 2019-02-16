// TerrainCtrlr.ts
// 地形管理器：
// 控制tiledmap
// lly 2017.12.18

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";

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

/** 强制移动类型 */
export enum ForcedMoveType {
    none,
    left,
    right,
    flow, // 缓慢增加向上的速度
    up, // 直接变换向上的速度
}

/** 门类型 */
export enum GateType {
    side = 1,
    mid,
}

const GidTypeList = [
    CollisionType.none,

    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
    CollisionType.entity,
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
    CollisionType.platform,
    CollisionType.platform,
    CollisionType.platform,
    CollisionType.platform,
    CollisionType.none,
    CollisionType.none,

    CollisionType.none,
    CollisionType.platform,
    CollisionType.none,
]

@ccclass
export class TerrainCtrlr extends MyComponent {

    /** 地图块数 */
    tileNumSize: cc.Size = cc.size(999999, 999999);
    /** 地形尺寸 */
    terrainSize: cc.Size = cc.size(999999, 999999);
    /** 碰撞数据 */
    collisionData: number[][] = null;

    setTerrainData(clsnData: number[][]) {
        this.collisionData = clsnData;
        this.tileNumSize = cc.size(clsnData[0].length, clsnData.length);
        this.terrainSize = new cc.Size(this.tileNumSize.width * TileLength, this.tileNumSize.height * TileLength - 0.001);
        this.node.setContentSize(this.terrainSize);
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
     * 根据瓦片id，转换成所代表的碰撞类型 十位个位为碰撞类型，百位为key
     */
    _getTypeFromGid(gid: number): CollisionType {
        return GidTypeList[gid % 100];
    }

    _getSlopeDir(gid: number): number {
        switch (gid) {
            case 17: return 1;
            case 18: return -1;
            default: return null;
        }
    }

    /**
     * 获取强制移动速度方向
     * @returns ForcedMoveType
     */
    _getForcedMoveDir(gid: number): ForcedMoveType {
        if (Math.floor(gid / 100) % 10 != 2) return ForcedMoveType.none;

        let moveKey = Math.floor(gid / 1000);
        switch (moveKey) {
            case 49: return ForcedMoveType.right;
            case 50: return ForcedMoveType.left;
            case 51: return ForcedMoveType.up;
            case 52: return ForcedMoveType.flow;
            default: return ForcedMoveType.none;
        }
    }

    /**
     * 如果是门（边门，中门），则获得门的id，否则获得空
     */
    _getGateGid(gid: number): number {
        if (Math.floor(gid / 100) % 10 == 1) {
            return gid;
        } else return null;
    }

    getGateKey(gid: number): number {
        return Math.floor(gid / 100000);
    }

    getGateType(gid: number): GateType {
        return Math.floor(gid / 10000) % 10 == 5 ? GateType.mid : GateType.side;
    }

    getGateIndex(gid: number): number {
        return Math.floor(gid / 1000) % 10;
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
        }
        if (!rightBegin && (t == CollisionType.none || t == CollisionType.slope)) {
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
     * 获取强制移动类型
     * @param x 位置
     * @param y 位置
     */
    getForcedMoveType(x: number, y: number): ForcedMoveType {
        let {tileX, tileY} = this._getTileIndex(x, y);
        let gid = this._getGid(tileX, tileY);
        if (!gid) return ForcedMoveType.none;

        return this._getForcedMoveDir(gid);
    }

    getGateData(x: number, y: number): number {
        let {tileX, tileY} = this._getTileIndex(x, y);
        let gid = this._getGid(tileX, tileY);
        if (!gid) return;

        return this._getGateGid(gid);
    }
}
