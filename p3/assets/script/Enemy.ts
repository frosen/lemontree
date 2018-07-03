// Enemy.ts
// 敌人类：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import Destroyee from "./Destroyee";
import EnemyCtrlr from "./EnemyCtrlr";

import AttriForEnemy from "./AttriForEnemy";
import Attack from "./Attack";
import {CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";

import {Hero} from "./Hero";
import FigureDisplay from "./FigureDisplay";
import DeathEffectDisplay from "./DeathEffectDisplay";


@ccclass
export default class Enemy extends Destroyee {

    static ctrlr: EnemyCtrlr = null;
    static figureDisplay: FigureDisplay = null;
    static deathDisplay: DeathEffectDisplay = null;

    ctrlrIndex: number = null;

    /** 属性 */
    attri: AttriForEnemy = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;

    onLoad() {
        super.onLoad();

        this.attri = this._createComp(AttriForEnemy);
        this.watchCollider = this._createComp(ObjColliderForWatch);
        this.watchCollider.callback = this.onWatching.bind(this);

        if (CC_EDITOR) return;

        if (!Enemy.ctrlr) 
            Enemy.ctrlr = cc.find("main/enemy_layer").getComponent(EnemyCtrlr);
        if (!Enemy.figureDisplay) 
            Enemy.figureDisplay = cc.find("main/figure_layer").getComponent(FigureDisplay);
        if (!Enemy.deathDisplay) 
            Enemy.deathDisplay = cc.find("main/enemy_layer").getComponent(DeathEffectDisplay);
    }

    lateUpdate() {
        // 超出地形则会死亡
        if (this.node.y < -1) {
            this.gotoDead();
        }
    }

    reset(index: number, lv: number) {
        this.ctrlrIndex = index;
        this.attri.reset(lv);
        this._resetAction();
    }

    /** 需要继承 */
    _resetAction() {
        
    }

    // 碰撞回调 ------------------------------------------------------------

    _calcHurt(atk: Attack): {death: boolean, dmg: number, crit: boolean} {
        let {dmg, crit} = atk.getDamage();
        this.attri.hp.add(-dmg);       

        let death = this.attri.hp.get() <= 0;
        return {death, dmg, crit};
    }

    _hurt(pos: cc.Vec2, atk: Attack, dmg: number, crit: boolean) {
        this.onHurtCallback(dmg, crit);

        // 显示受伤数字
        Enemy.figureDisplay.showFigure(pos, dmg, crit, atk.magicAttack);
    }

    // 用于子类
    onHurtCallback(dmg: number, crit: boolean) {

    }

    _dead(pos: cc.Vec2) {
        Enemy.deathDisplay.showDeathEffect(pos);
        Enemy.ctrlr.killEnemy(this);
    }

    // 观察回调 ========================================================

    aim: Hero = null;
    aimDir: number = 0;

    onWatching(collisionDatas: CollisionData[]) {
        this.aim = null;
        for (const collisionData of collisionDatas) {
            let cldr = collisionData.cldr;
            if (cldr.constructor == ObjColliderForWatch) continue;
            let hero = cldr.getComponent("Hero");
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
