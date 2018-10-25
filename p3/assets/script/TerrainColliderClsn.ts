// TerrainColliderClsn.ts
// 地形碰撞组件
// 拥有此组件的单位会进行与地形形成碰撞
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import TerrainCollider from "./TerrainCollider";
import {CollisionType, ForcedMoveType} from "./TerrainCtrlr";

@ccclass
export default class TerrainColliderClsn extends TerrainCollider {

    /** 边缘类型，可以是none, entity或者slope，不在边缘则为空 */
    edgeType: CollisionType = null;
    backEdgeType: CollisionType = null;
    forcedMoveType: ForcedMoveType = null;

    _checkCollision() {
        let saveX = this.node.x; // 在没有碰撞的情况下，x该到的位置
        let {xDir, yDir} = this.movableObj.getDir(); // 获取方向
        let size = this.tsize || this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();
        let anchorW = size.width * anchor.x;
        let anchorH = size.height * anchor.y;
        let realDir = xDir != 0 ? xDir : this.node.scaleX; // 移动时检测移动方向，否则检测面朝向

        //========================================================
        let preTestXClsnType: CollisionType = CollisionType.none; // 前置测试x类型
        if (xDir != 0) {
            let checkX = this.node.x - anchorW + (xDir > 0 ? size.width : 0);
            let checkY = this.node.y - anchorH;
            let checkYEnd = checkY + size.height - 1;
            preTestXClsnType = this.terrainCtrlr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);
            if (preTestXClsnType == CollisionType.entity) { // 有碰撞

                let distance = this.terrainCtrlr.getDistanceToTileSide(checkX, xDir);
                let xPos = this.node.x - distance;

                // 第一次检测x碰撞，其后退不可超过上次点的位置，否则会有y轴判断的错误
                if (xDir > 0) xPos = Math.max(xPos, this.movableObj.xLastPos);
                else xPos = Math.min(xPos, this.movableObj.xLastPos);

                this.node.x = xPos;
            }
        }

        //========================================================
        let checkX = this.node.x - anchorW; // 从左往右计算上下的碰撞
        let checkXEnd = checkX + size.width - 1; // 使能通过标准的一个瓦片所以减1

        let checkY = this.node.y - anchorH + (yDir > 0 ? size.height : 0);

        let {type, edgeLeft, edgeRight} = this.terrainCtrlr.checkCollideInHorizontalLine(checkX, checkXEnd, checkY);

        this.curYCollisionType = type;
        if (yDir < 0 && type != CollisionType.none) {
            if (realDir > 0) {
                this.edgeType = edgeRight;
                this.backEdgeType = edgeLeft;
            } else {
                this.edgeType = edgeLeft;
                this.backEdgeType = edgeRight;
            }
        } else {
            this.edgeType = null;
            this.backEdgeType = null;
        }

        if (this.curYCollisionType == CollisionType.entity) { // 有碰撞
            let distance = this.terrainCtrlr.getDistanceToTileSide(checkY, yDir);
            this.node.y -= distance;
            this.movableObj.yVelocity = 0;

        } else if (this.curYCollisionType == CollisionType.slope) {
            if (preTestXClsnType == CollisionType.entity) {
                let distance = this.terrainCtrlr.getDistanceToTileSide(checkY, yDir);
                this.node.y -= distance;
            }

        } else if (this.curYCollisionType == CollisionType.platform) { // 有只向下而且能越过的碰撞
            if (yDir < 0) { // 只检测向下
                let distance = this.terrainCtrlr.getDistanceToTileSide(checkY, yDir);
                let nodeYInMargin = this.node.y - distance;

                // 用上一个点是否在边缘之上来确定是否碰撞，可以用改变上一点的方式越过
                if (this.movableObj.yLastPos - nodeYInMargin > -0.01) {
                    this.node.y = nodeYInMargin;
                    this.movableObj.yVelocity = 0;
                } else {
                    this.curYCollisionType = CollisionType.none; // 过了最上一条边后就不可碰撞了
                }
            } else {
                this.curYCollisionType = CollisionType.none; // 不是向下则platform不可碰撞
            }
        }

        //========================================================

        // 第一次x碰撞检测可能会因为y轴碰撞未进行而导致误判，
        // 所以需要在y检测后再检测一次，如果未碰撞则移动到相应位置
        if (xDir != 0 && preTestXClsnType == CollisionType.entity) {
            let checkX = saveX - anchorW + (xDir > 0 ? size.width : 0);
            let checkY = this.node.y - anchorH;
            let checkYEnd = checkY + size.height - 1;
            this.curXCollisionType = this.terrainCtrlr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);

            if (this.curXCollisionType == CollisionType.entity) {
                this.movableObj.xVelocity = 0;
                this.edgeType = CollisionType.entity;
            } else {
                this.node.x = saveX;
                this.edgeType = null;
            }
        } else {
            this.curXCollisionType = CollisionType.none;
        }

        {
            // 先检测左侧，再检测右侧，反正<需要确保>不会同时有
            let checkX = this.node.x - anchorW;
            let checkY = this.node.y - anchorH;

            let yOffset: number = this.terrainCtrlr.getSlopeOffset(checkX, checkY, 1);
            if (yOffset != null) {
                if (yOffset >= -0.01) {
                    this.node.y += yOffset;
                    this.curYCollisionType = CollisionType.slope;
                    if (realDir <= 0) {
                        this.edgeType = CollisionType.slope;
                        this.backEdgeType = null;
                    } else {
                        this.backEdgeType = CollisionType.slope;
                        this.edgeType = null;
                    }
                } else {
                    this.curYCollisionType = CollisionType.none;
                    this.edgeType = null;
                    this.backEdgeType = null;
                }

            } else {
                let checkXEnd = checkX + size.width -1;
                let yOffset: number = this.terrainCtrlr.getSlopeOffset(checkXEnd, checkY, -1);
                if (yOffset != null) {
                    if (yOffset > -0.01) {
                        this.node.y += yOffset;
                        this.curYCollisionType = CollisionType.slope;
                        if (realDir >= 0) {
                            this.edgeType = CollisionType.slope;
                            this.backEdgeType = null;
                        } else {
                            this.backEdgeType = CollisionType.slope;
                            this.edgeType = null;
                        }
                    } else {
                        this.curYCollisionType = CollisionType.none;
                        this.edgeType = null;
                        this.backEdgeType = null;
                    }
                }
            }
        }

        //========================================================

        // 检测强制移动（影响下一帧的位置）
        {
            let checkX = this.node.x - anchorW + size.width * 0.5;
            let checkY = this.node.y - anchorH - 1;
            let {dir, vX, vY} = this.terrainCtrlr.calcForcedMoveVel(checkX, checkY, 0, this.movableObj.yVelocity);
            this.forcedMoveType = dir;
            this.movableObj.xEnvVelocity = vX; // x轴方向需要进行叠加
            this.movableObj.yVelocity = vY; // y轴方向直接改变当前速度，才可以和重力适配
        }

        //========================================================

        this._checkOutOfRange();
    }
}