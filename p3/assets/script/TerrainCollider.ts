// TerrainCollider.ts
// 地形碰撞检测组件
// 检测，但不响应碰撞
// lly 2018.10.12

const {ccclass, property, executionOrder} = cc._decorator;

import MyComponent from "./MyComponent";
import {MovableObject} from "./MovableObject";
import {TerrainCtrlr, CollisionType} from "./TerrainCtrlr";

@ccclass
@executionOrder(EXECUTION_ORDER.TerrainCollider)
export default class TerrainCollider extends MyComponent {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地图的碰撞检测 */
    terrainCtrlr: TerrainCtrlr = null;

    /** 当前碰撞状态 */
    curXCollisionType: CollisionType = CollisionType.none;
    curYCollisionType: CollisionType = CollisionType.none;

    /** x轴方向是否出界 */
    xOutRangeDir: number = 0;
    /** y轴方向是否出界 */
    yOutRangeDir: number = 0;

    /** 碰撞范围 为空的话则使用node的size*/
    size: cc.Size = null;

    onLoad() {
        requireComponents(this, [MovableObject]);

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCtrlr = cc.find("main/map").getComponent(TerrainCtrlr);
    }

    update(_: number) {
        this._checkCollision();
        this._checkOutOfRange();
    }

    _checkCollision() { // 不考虑旋转，不应该有旋转，或者旋转的节点不应该宽高不一致
        let {xDir, yDir} = this.movableObj.getDir(); // 获取方向
        let size = this.size || this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();
        let anchorW = size.width * anchor.x;
        let anchorH = size.height * anchor.y;

        let xCenter = this.node.x - anchorW + size.width * 0.5;
        let yCenter = this.node.y - anchorH + size.height * 0.5;

        if (xDir != 0) {
            this.curXCollisionType = this.terrainCtrlr.checkCollideAt(xCenter + size.width * 0.5 * xDir, yCenter);
        } else {
            this.curXCollisionType = CollisionType.none;
        }

        if (yDir != 0) {
            this.curYCollisionType = this.terrainCtrlr.checkCollideAt(xCenter, yCenter + size.height * 0.5 * yDir);
        } else {
            this.curYCollisionType = CollisionType.none;
        }
    }

    _checkOutOfRange() {
        let size = this.size || this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();
        let anchorW = size.width * anchor.x;
        let anchorH = size.height * anchor.y;

        let xCenter = this.node.x - anchorW + size.width * 0.5;
        let yCenter = this.node.y - anchorH + size.height * 0.5;

        // 计算是否出界
        if (xCenter < 0) {
            this.xOutRangeDir = -1;
        } else if (this.terrainCtrlr.terrainSize.width <= xCenter) {
            this.xOutRangeDir = 1;
        } else {
            this.xOutRangeDir = 0;
        }

        if (yCenter < 0) {
            this.yOutRangeDir = -1;
        } else if (this.terrainCtrlr.terrainSize.height <= yCenter) {
            this.yOutRangeDir = 1;
        } else {
            this.yOutRangeDir = 0;
        }
    }
}
