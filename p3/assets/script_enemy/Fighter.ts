// EnemyOfFighter.ts
// 战士：
// lly 2018.3.27

const {ccclass, property} = cc._decorator;

import Enemy from "../script/Enemy";

import {MovableObject} from "../script/MovableObject";
import TerrainCollider from "../script/TerrainCollider";
import {CollisionType} from "../script/TerrainCtrlr";

@ccclass
export default class EnemyOfFighter extends Enemy {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollider: TerrainCollider = null;

    onLoad() {
        super.onLoad();

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollider = this.getComponent(TerrainCollider);
    }

    // UI相关 ========================================================

    // 基本行动 ========================================================

    moveForward() {
        this.movableObj.xVelocity = this.node.scaleX * 1;
    }

    stopMoving() {
        this.movableObj.xVelocity = 0;
    }

    turnAround() {
        this.node.scaleX *= -1;
    }

    moveToAim() {
        this.node.scaleX = Math.abs(this.node.scaleX) * this.aimDir;
        this.movableObj.xVelocity = this.node.scaleX * 3;
    }

    // 对于行为树的判断 ========================================================

    isEdgeForward(): boolean {
        return this.terrainCollider.edgeType == CollisionType.none;
    }

    isBlockForward(): boolean {
        return this.terrainCollider.edgeType == CollisionType.entity;
    }
}
