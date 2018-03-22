// Enemy.ts
// 敌人类：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import Attack from "./Attack";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";

import Hero from "./Hero";

/** 敌人对于一种伤害的无敌时间（毫秒） */
const InvcTime: number = 1000;

@ccclass
export default class Enemy extends cc.Component {

    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;

    onLoad() {
        // init logic
        requireComponents(this, [Attack, ObjCollider, ObjColliderForWatch]);

        this.objCollider = this.getComponent(ObjCollider);
        this.watchCollider = this.getComponent(ObjColliderForWatch);

        // 回调
        this.objCollider.callback = this.onCollision.bind(this);
        this.watchCollider.callback = this.onWatching.bind(this);
    }

    // 碰撞回调 ------------------------------------------------------------

    /** 对于某种伤害上一次碰撞的时间（毫秒） */
    invcTimeBegin: {[key: number]: number;} = {}

    onCollision(collisionDatas: CollisionData[]) {
        for (const data of collisionDatas) {
            if (data.cldr.constructor != ObjCollider) continue; // 避免碰撞到视野
            let atk = data.cldr.getComponent(Attack);
            if (atk) { // 如果碰撞对象带有攻击性
                let atkIndex = atk.index;
                let curTime = (new Date()).getTime();
                let beginTime = this.invcTimeBegin[atkIndex]
                if (beginTime == null || curTime - beginTime > InvcTime) {
                    this.invcTimeBegin[atkIndex] = curTime;
                    this.doHurtLogic(atk);                   
                }
            }         
        }       
    }

    doHurtLogic(atk: Attack) {
        // llytodo 计算受伤
        // llytodo 显示受伤
    }

    // 观察回调 ========================================================

    aim: Hero = null;
    aimDir: number = 0;

    onWatching(collisionDatas: CollisionData[]) {
        this.aim = null;
        for (const collisionData of collisionDatas) {
            let cldr = collisionData.cldr;
            if (cldr.constructor == ObjColliderForWatch) continue;
            let hero = cldr.getComponent(Hero);
            if (hero) {
                if (!this.aim) {
                    this.aim = hero;
                } else {
                    let d1 = Math.abs(hero.node.x - this.node.x);
                    let d2 = Math.abs(this.aim.node.x - this.node.x);
                    if (d1 < d2) {
                        this.aim = hero;
                    }
                }
            }
        }
        
        this.aimDir = this.aim ? (this.aim.node.x - this.node.x > 0 ? 1 : -1) : 0;
    }

    // 基本行动 ------------------------------------------------------------

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
