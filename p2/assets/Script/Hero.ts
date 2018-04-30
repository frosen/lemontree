// Hero.ts
// 英雄：
// 英雄的主类，进行多个组件的交互
// lly 2017.12.12

const {ccclass, property} = cc._decorator;
const sch = cc.director.getScheduler();

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";
import {HeroLooks, HeroDirLv} from "./HeroLooks";

import AttriForHero from "./AttriForHero";
import {ActState, SMForHeroMgr, InvcState, SMForHeroInvcMgr} from "./SMForHero";

import UICtrlr from "./UICtrlr";

import Attack from "./Attack";
import Enemy from "./Enemy";

import ItemComp from "./ItemComp";
import Item from "./Item";
import {ItemExp} from "./ItemExp";
import {ItemEfc} from "./ItemEfc";

export enum HeroUsingType {
    pickUp,
    trigger,
    jumpDown,
}

@ccclass
export class Hero extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollider: TerrainCollider = null;
    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;

    /** 英雄UI */
    looks: HeroLooks = null;
    /** 攻击范围 */
    attack: Attack = null;

    /** 英雄属性 */
    attri: AttriForHero = null;
    /** 英雄状态机 */
    sm: SMForHeroMgr = null;
    /** 英雄无敌状态机 */
    smInvc: SMForHeroInvcMgr = null;

    ui: UICtrlr = null;

    /** x轴移动方向 */
    xMoveDir: number = 0;

    onLoad() {
        requireComponents(this, [MovableObject, TerrainCollider, ObjCollider, ObjColliderForWatch, HeroLooks]);

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollider = this.getComponent(TerrainCollider);
        this.objCollider = this.getComponent(ObjCollider);
        this.watchCollider = this.getComponent(ObjColliderForWatch);

        this.looks = this.getComponent(HeroLooks);
        this.attack = this.getComponentInChildren(Attack);

        this.attri = this.getComponent(AttriForHero);
        this.sm = new SMForHeroMgr(this).begin(ActState.stand);
        this.smInvc = new SMForHeroInvcMgr(this);    
        
        this.ui = cc.find("canvas/ui").getComponent(UICtrlr);
        
        // 回调
        this.objCollider.callback = this.onCollision.bind(this);
        this.watchCollider.callback = this.onWatching.bind(this);
    }

    update(dt: number) {
        let realDt = dt * sch.getTimeScale();
        this.sm.machineUpdate(realDt);
        this.smInvc.machineUpdate(realDt);
    }

    lateUpdate() {
        this.sm.machineCheck();

        // 如果处于platform上，显示下跳按钮
        this.setUsingType(HeroUsingType.jumpDown, this.terrainCollider.curYCollisionType == CollisionType.platform);
    }

    // 动作 被控制器调用 -------------------------------------------------
 
    /**
     * 移动
     * @param dir: 1向右 -1向左 0停止
     */
    move(dir: number) {
        this.xMoveDir = dir;
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

    /** 当前点击使用按钮会触发的类型 */
    curUsingTypeStates: [boolean, boolean, boolean] = [false, false, false];
    curUsingType: HeroUsingType = null;

    /**
     * 使用（捡起道具 > 触发机关（进入门之类的） > 下跳）
     */
    use() {
        switch (this.curUsingType) {
            case HeroUsingType.pickUp: this.pickUp(); break;
            case HeroUsingType.trigger: this.trigger(); break;
            case HeroUsingType.jumpDown: this.jumpDown(); break;
        }
    }

    pickUp() {
        cc.log(">>", "pick up");
        let item: ItemEfc = this.efcItems[0];

        let comp = item.comp;

        comp.onCollision();
    }

    trigger() {

    }

    jumpDown() {
        this.node.y -= 2;
    }

    setUsingType(t: HeroUsingType, b: boolean) {
        this.curUsingTypeStates[t] = b;
        
        if (this.curUsingTypeStates[HeroUsingType.pickUp]) {
            this.curUsingType = HeroUsingType.pickUp;
        } else if (this.curUsingTypeStates[HeroUsingType.trigger]) {
            this.curUsingType = HeroUsingType.trigger;
        } else if (this.curUsingTypeStates[HeroUsingType.jumpDown]) {
            this.curUsingType = HeroUsingType.jumpDown;
        } else {
            this.curUsingType = null;
        }

        this.ui.showUsingButton(this.curUsingType);
    }

    // 碰撞相关 ------------------------------------------------------------

    /** 当前碰撞到的有伤害的对象 */
    hurtCollisionData: CollisionData = null;

    efcItems: ItemEfc[] = [];

    /**
     * 碰撞回调函数
     * @param collisionDatas: 当前帧碰撞到的对象的碰撞数据
     */
    onCollision(collisionDatas: CollisionData[]) {

        this.hurtCollisionData = null;
        this.efcItems = [];
        
        for (const data of collisionDatas) {
            if (data.cldr.constructor != ObjCollider) continue; // 避免碰撞到视野

            let atk = data.cldr.getComponent(Attack)
            if (atk && atk.enabled) { // 如果碰撞对象带有攻击性
                this.hurtCollisionData = data;
            }

            let itemComp = data.cldr.getComponent(ItemComp); // 道具碰撞
            let item: Item = itemComp.itemCore;
            if (item instanceof ItemExp) {
                let exp = (<ItemExp>item).getExp();
                this.attri.exp += exp;
                itemComp.onCollision();

            } else { // 不是exp就是efc
                this.efcItems.push(<ItemEfc>item);
            }
        }

        // 触碰到了道具，则显示按钮
        this.setUsingType(HeroUsingType.pickUp, this.efcItems.length > 0);
    }

    /**
     * 获取受伤方向
     * 注意：调用前要确保hurtCollisionData存在
     * @return 1从右边受伤，-1从左边受伤
     */
    getHurtDir(): number {
        let hurtNodeCenterX = (this.hurtCollisionData.minX + this.hurtCollisionData.maxX) * 0.5;
        return this.node.x < hurtNodeCenterX ? 1 : -1;;
    }

    /**
     * 获取受伤的攻击类
     * 注意：调用前要确保hurtCollisionData存在
     * @return 攻击类
     */
    getHurtAtk(): Attack {
        return this.hurtCollisionData.cldr.getComponent(Attack);
    }

    // 观察到附近的敌人 ------------------------------------------------------------

    /** 当前观察到的敌人碰撞属性 */
    watchedCollisionData: CollisionData = null;

    onWatching(collisionDatas: CollisionData[]) {
        if (this.noAtkState) return;

        let havingDataBefore: boolean = (this.watchedCollisionData != null);

        // 以移动方向的目标作为主目标
        let curDir: number = this.looks.xUIDirs[HeroDirLv.move];
        let enmeyDir: number;
        this.watchedCollisionData = null;
        for (const data of collisionDatas) {
            if (data.cldr.constructor != ObjCollider) continue; // 避免碰撞到视野
            if (!data.cldr.getComponent(Enemy)) continue; // 如果观察到的是敌人，而不是子弹机关之类的
            this.watchedCollisionData = data;
            enmeyDir = ((data.minX + data.maxX) * 0.5 >= this.node.x) ? 1 : -1;
            if (enmeyDir == curDir) break;              
        }

        if (this.watchedCollisionData) {
            this.looks.attack(enmeyDir);
        } else if (havingDataBefore) {
            this.looks.endAttack();
        }       
    }

    /** 调用attack组件，进行一次攻击 */
    doAttackLogic() {
        this.attack.enabled = true;
        this.attack.changeIndex();
    }

    stopAttackLogic() {
        this.attack.enabled = false;
    }

    // 被状态机调用 ------------------------------------------------------------

    /**
     * 受伤检测，其实就是检测碰撞
     * @return true为碰撞了
     */
    checkHurt(): boolean {
        if (this.smInvc.state == InvcState.on) return false;
        return this.hurtCollisionData != null;
    }

    /**
     * 开始无敌状态
     * @param time: 无敌持续时间
     */
    beginInvcState(time: number) {
        this.smInvc.begin(time);
    }

    /** 不可攻击状态 */
    noAtkState: boolean = false;

    /**
     * 进入、退出不可攻击状态
     */
    setNoAtkStateEnabled(b: boolean) {
        if (b) this.looks.endAttack();
        this.noAtkState = b;
        this.looks.endAttackAtOnce();
    }
}
