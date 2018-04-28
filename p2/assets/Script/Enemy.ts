// Enemy.ts
// 敌人类：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import AttriForEnemy from "./AttriForEnemy";
import Attack from "./Attack";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";

import {Hero} from "./Hero";
import FigureDisplay from "./FigureDisplay";
import DeathEffectDisplay from "./DeathEffectDisplay";
import ItemCtrlr from "./ItemCtrlr";

/** 敌人对于一种伤害的无敌时间（毫秒） */
const InvcTime: number = 1000;

@ccclass
export default class Enemy extends cc.Component {

    /** 属性 */
    attri: AttriForEnemy = null;
    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;

    figureDisplay: FigureDisplay = null;
    deathDisplay: DeathEffectDisplay = null;
    itemCtrlr: ItemCtrlr = null;

    /** 所有带有精灵的节点，用于显示受伤 */
    allSpNodes: cc.Node[] = [];

    onLoad() {
        // init logic
        requireComponents(this, [AttriForEnemy, Attack, ObjCollider, ObjColliderForWatch]);

        this.attri = this.getComponent(AttriForEnemy);
        this.objCollider = this.getComponent(ObjCollider);
        this.watchCollider = this.getComponent(ObjColliderForWatch);

        this.figureDisplay = cc.find("main/figure_layer").getComponent(FigureDisplay);
        this.deathDisplay = cc.find("main/enemy_layer").getComponent(DeathEffectDisplay);
        this.itemCtrlr = cc.find("main/item_layer").getComponent(ItemCtrlr);

        // 回调
        this.objCollider.callback = this.onCollision.bind(this);
        this.watchCollider.callback = this.onWatching.bind(this);

        // 获取精灵节点
        let allSps = this.getComponents(cc.Sprite);
        for (const sp of allSps) {
            this.allSpNodes.push(sp.node);
        }
    }

    // 碰撞回调 ------------------------------------------------------------

    /** 对于某种伤害上一次碰撞的时间（毫秒） */
    invcTimeBegin: {[key: number]: number;} = {}

    onCollision(collisionDatas: CollisionData[]) {
        for (const data of collisionDatas) {
            if (data.cldr.constructor != ObjCollider) continue; // 避免碰撞到视野
            let atk = data.cldr.getComponent(Attack);
            if (atk && atk.enabled) { // 如果碰撞对象带有攻击性
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
        // 计算受伤
        let {dmg, crit} = atk.getDamage();
        this.attri.hp -= dmg;
        atk.excuteHitCallback(this.node);

        // 显示受伤数字
        let pos: cc.Vec2 = this.getCenterPos();
        this.figureDisplay.showFigure(pos, dmg, crit, atk.magicAttack);

        if (this.attri.hp <= 0) { 
            this.dead();
            return;
        }

        // 显示受伤，所有ui变红
        this.showHurtColor();
        this.scheduleOnce(this.recoveryHurtColor.bind(this), 0.1);

        // 用于子类
        this.onHurtCallback(dmg, crit);
    }

    showHurtColor() {
        for (const spNode of this.allSpNodes) {
            spNode.color = cc.color(255, 80, 80, 255);
        }
    }

    recoveryHurtColor() {
        for (const spNode of this.allSpNodes) {
            spNode.color = cc.Color.WHITE;
        }
    }

    getCenterPos(): cc.Vec2 {
        let node = this.node;  
        let xCenter = node.x + node.width * (0.5 - node.anchorX);
        let yCenter = node.y + node.height * (0.5 - node.anchorY);
        return cc.v2(xCenter, yCenter);
    }

    // 用于子类
    onHurtCallback(dmg: number, crit: boolean) {

    }

    dead() {
        let pos: cc.Vec2 = this.getCenterPos();
        this.deathDisplay.showDeathEffect(pos);
        this.itemCtrlr.createItem(pos);
        this.node.removeFromParent();
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

    /**
     * 目标位置
     * @returns 1为在身前，2为在身后，没有目标为0
     */
    getAimDir(): number {
        if (this.aim) {
            return this.aimDir == this.node.scaleX ? 1 : -1;
        } else {
            return 0;
        }
    }

    // UI相关 ========================================================

    // 基本行动 ------------------------------------------------------------
}
