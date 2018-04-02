// EnemyFighter.ts
// 战士：
// lly 2018.3.27

const {ccclass, property} = cc._decorator;

import Enemy from "./Enemy";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";

@ccclass
export default class EnemyFighter extends Enemy {

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

    isEdgeForward(): boolean {
        let edge = this.getComponent(TerrainCollider).edgeType;
        return edge == CollisionType.none || edge == CollisionType.entity;
    }

    getAimDir(): number {
        if (this.aim) {
            return this.aimDir == this.node.scaleX ? 1 : -1;
        } else {
            return 0;
        }
    }

    moveToAim() {
        this.node.scaleX = Math.abs(this.node.scaleX) * this.aimDir;

        let movableObj = this.getComponent(MovableObject);
        movableObj.xVelocity = this.node.scaleX * 3;
    }
}
