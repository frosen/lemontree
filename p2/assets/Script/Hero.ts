// Hero.ts
// 英雄：
// 英雄的主类，进行多个组件的交互
// lly 2017.12.12

const {ccclass, property, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";
import TerrainCollision from "./TerrainCollision";
import {CollisionType} from "./TerrainManager";

import AttriForHero from "./AttriForHero";
import {StateForHero, ActState, Dir} from "./StateForHero";

/** 起跳速度 */
const JumpVelocity: number = 3;
/** 最大起跳加速时间（秒） */
const MaxJumpAcceTime: number = 1;

@ccclass
@requireComponent(MovableObject)
@requireComponent(TerrainCollision)
export default class Hero extends cc.Component {

    /** 英雄属性 */
    attri: AttriForHero = null;
    /** 英雄状态 */
    state: StateForHero = null;

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollision: TerrainCollision = null;

    /** x轴移动方向 */
    xDir: number = 0;
    /** 跳跃加速中 */
    jumpAccelerating: boolean = false;

    onLoad() {
        this.attri = new AttriForHero();
        this.state = new StateForHero();

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollision = this.getComponent(TerrainCollision);
    }

    update() {
        // 持续不断的速度，所以放在update中
        this.movableObj.setInitialVelocity(this.xDir * this.attri.speed, null);

        // 跳跃加速中
        if (this.jumpAccelerating) this.movableObj.setInitialVelocity(null, JumpVelocity);
    }

    lateUpdate() {
        this._checkJump();

    }

    /**
     * 检测跳跃（上下，落地）
     */
    _checkJump() {
        if (this.terrainCollision.getCurCollisionType().y != CollisionType.none) {
            this._onEndingJumpAcce();
        }

        if (this.state.getActState() == ActState.jumpUp) {
            let {yDir} = this.movableObj.getDir();
            if (yDir < 0) {
                this.state.setActState(ActState.jumpDown);
            }
        } else if (this.state.getActState() == ActState.jumpDown) {
            if (this.terrainCollision.getCurCollisionType().y != CollisionType.none) {
                this.state.setActState(ActState.stand);
            }
        }
    }

    // 动作 -------------------------------------------------
 
    /**
     * 移动
     * @param dir: 1向右 -1向左 0停止
     */
    move(dir: number) {
        this.xDir = dir;
    }

    /**
     * 冲刺
     */
    dash() {

    }

    /**
     * 跳跃，通过加速时间不同，可控制跳跃高度
     * @param accelerating: true开始跳跃速度，false结束速度开始自由落体
     */
    jump(accelerating: boolean) {
        if (accelerating) {
            if (this.jumpAccelerating) return;
            this.scheduleOnce(this._onEndingJumpAcce, MaxJumpAcceTime);

            this.jumpAccelerating = true;
            this.state.setActState(ActState.jumpUp);
        } else {
            this.endJumpAcce();
        }
    }

    /** 结束跳跃 */
    endJumpAcce() {
        if (!this.jumpAccelerating) return;
        this.jumpAccelerating = false;
        this.unschedule(this._onEndingJumpAcce);
    }

    /** 结束跳跃，用于回调 */
    _onEndingJumpAcce() {
        this.jumpAccelerating = false;
    }

    /**
     * 使用（拾起药水>进入门>下跳）
     */
    use() {
        this.node.y -= 2;
    }
}
