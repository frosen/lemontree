// Hero.ts
// 英雄：
// 英雄的主类，进行多个组件的交互
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";
import {HeroUI, UIDirLvType} from "./HeroUI";

import AttriForHero from "./AttriForHero";
import {ActState, SMForHeroMgr, InvcState, SMForHeroInvcMgr} from "./SMForHero";

import Attack from "./Attack";
import Enemy from "./Enemy";

@ccclass
export default class Hero extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollider: TerrainCollider = null;
    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;

    /** 英雄UI */
    ui: HeroUI = null;
    /** 攻击范围 */
    attack: Attack = null;

    /** 英雄属性 */
    attri: AttriForHero = null;
    /** 英雄状态机 */
    sm: SMForHeroMgr = null;
    /** 英雄无敌状态机 */
    smInvc: SMForHeroInvcMgr = null;

    /** x轴移动方向 */
    xMoveDir: number = 0;

    onLoad() {
        requireComponents(this, [MovableObject, TerrainCollider, ObjCollider, ObjColliderForWatch, HeroUI]);

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollider = this.getComponent(TerrainCollider);
        this.objCollider = this.getComponent(ObjCollider);
        this.watchCollider = this.getComponent(ObjColliderForWatch);

        this.ui = this.getComponent(HeroUI);
        this.attack = this.getComponentInChildren(Attack);

        this.attri = this.getComponent(AttriForHero);
        this.sm = new SMForHeroMgr(this).begin(ActState.stand);
        this.smInvc = new SMForHeroInvcMgr(this);      
        
        // 回调
        this.objCollider.callback = this.onCollision.bind(this);
        this.watchCollider.callback = this.onWatching.bind(this);
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

    // 碰撞相关 ------------------------------------------------------------

    /** 当前碰撞到的有伤害的对象 */
    hurtCollisionData: CollisionData = null;

    /**
     * 碰撞回调函数
     * @param collisionDatas: 当前帧碰撞到的对象的碰撞数据
     */
    onCollision(collisionDatas: CollisionData[]) {
        // 敌人碰撞
        this.hurtCollisionData = null;
        for (const data of collisionDatas) {
            if (data.cldr.constructor != ObjCollider) continue; // 避免碰撞到视野
            let atk = data.cldr.getComponent(Attack)
            if (atk && atk.enabled) { // 如果碰撞对象带有攻击性
                this.hurtCollisionData = data;
                break;
            }         
        }

        // 道具碰撞 llytodo
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
        let curDir: number = this.ui.xUIDirs[UIDirLvType.move];
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
            this.ui.attack(enmeyDir);
        } else if (havingDataBefore) {
            this.ui.endAttack();
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
        if (b) this.ui.endAttack();
        this.noAtkState = b;
        this.ui.endAttackAtOnce();
    }
}
