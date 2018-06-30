// EnemyOfFighter.ts
// 战士：
// lly 2018.3.27

const {ccclass, property} = cc._decorator;

import Enemy from "./Enemy";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";

@ccclass
export default class EnemyOfFighter extends Enemy {

    // UI相关 ========================================================

    // 基本行动 ========================================================

    moveForward() {
        let movableObj = this.getComponent(MovableObject);
        movableObj.xVelocity = this.node.scaleX * 1;
    }

    stopMoving() {
        this.getComponent(MovableObject).xVelocity = 0;
    }

    turnAround() {
        this.node.scaleX *= -1;
    }

    moveToAim() {
        this.node.scaleX = Math.abs(this.node.scaleX) * this.aimDir;

        let movableObj = this.getComponent(MovableObject);
        movableObj.xVelocity = this.node.scaleX * 3;
    }

    // 对于行为树的判断 ========================================================

    isEdgeForward(): boolean {
        let edge = this.getComponent(TerrainCollider).edgeType;
        return edge == CollisionType.none || edge == CollisionType.entity;
    }
}
