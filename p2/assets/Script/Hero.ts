// Hero.ts
// 英雄：
// 英雄的主类，进行多个组件的交互
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import MovableObject from "./MovableObject";
import TerrainCollision from "./TerrainCollision";
import ObjCollision from "./ObjCollision";
import {HeroUI, UIDirLvType} from "./HeroUI";

import AttriForHero from "./AttriForHero";
import {ActState, SMForHeroMgr, InvcState, SMForHeroInvcMgr} from "./SMForHero";

import Attack from "./Attack";

@ccclass
export default class Hero extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollision: TerrainCollision = null;
    /** 对象碰撞组件 */
    objCollision: ObjCollision = null;

    /** 英雄属性 */
    attri: AttriForHero = null;
    /** 英雄UI */
    ui: HeroUI = null;

    /** 英雄状态机 */
    sm: SMForHeroMgr = null;
    /** 英雄无敌状态机 */
    smInvc: SMForHeroInvcMgr = null;

    /** x轴移动方向 */
    xMoveDir: number = 0;

    onLoad() {
        requireComponents(this, [MovableObject, TerrainCollision, ObjCollision, HeroUI]);

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollision = this.getComponent(TerrainCollision);
        this.objCollision = this.getComponent(ObjCollision);
        this.ui = this.getComponent(HeroUI);

        this.attri = new AttriForHero();
        this.sm = new SMForHeroMgr(this, ActState.stand);
        this.smInvc = new SMForHeroInvcMgr(this);       
    }

    update(dt: number) {
        this.sm.machineUpdate(dt);
        this.smInvc.machineUpdate(dt);
    }

    lateUpdate() {
        this.sm.machineCheck();
    }

    // 动作 被控制器调用 -------------------------------------------------
 
    /**
     * 移动
     * @param dir: 1向右 -1向左 0停止
     */
    move(dir: number) {
        this.xMoveDir = dir;
        this.ui.setXUIDir(dir, UIDirLvType.move);
    }

    /**
     * 冲刺
     */
    dash() {
        this.sm.changeStateTo(ActState.dash);
    }

    /**
     * 跳跃，通过加速时间不同，可控制跳跃高度
     * @param accelerating: true开始跳跃速度，false结束速度开始自由落体
     */
    jump(accelerating: boolean) {
        if (accelerating) {
            this.sm.changeStateTo(ActState.jumpAccelerating);
        } else {
            if (this.sm.curState == ActState.jumpAccelerating) {
                this.sm.changeStateTo(ActState.jump);
            }
        }
    }

    /**
     * 使用（拾起药水>进入门>下跳）
     */
    use() {
        this.node.y -= 2;
    }

    // 被状态机调用 ------------------------------------------------------------

    hurtObj: ObjCollision = null;

    /**
     * 受伤检测，其实就是检测碰撞
     * return true为碰撞了
     */
    checkHurt(): boolean {
        if (this.smInvc.state == InvcState.on) return false;
        for (const clsn of this.objCollision.otherCollisionsInFrame) {
            if (clsn.node.getComponent(Attack)) {
                this.hurtObj = clsn;
                return true;
            }
        }
        return false;
    }

    checkHurtDir(): number {
        return this.node.x < this.hurtObj.node.x ? 1 : -1;;
    }

    beginInvcState(time: number) {
        this.smInvc.begin(time);
    }
}
