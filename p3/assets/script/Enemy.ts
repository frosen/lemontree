// Enemy.ts
// 敌人类：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import Destroyee from "./Destroyee";
import EnemyCtrlr from "./EnemyCtrlr";

import AttriForEnemy from "./AttriForEnemy";
import Attack from "./Attack";
import DebuffComp from "./DebuffComp";
import {CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";

import BTComp from "../script_bt/BTComp";

import {Hero} from "./Hero";
import FigureDisplay from "./FigureDisplay";
import DeathEffectDisplay from "./DeathEffectDisplay";
import Bullet from "./Bullet";

@ccclass
export default class Enemy extends Destroyee {

    static ctrlr: EnemyCtrlr = null;
    static figureDisplay: FigureDisplay = null;
    static deathDisplay: DeathEffectDisplay = null;

    @property debugMode: boolean = false;

    /** 用于控制器中的索引值 */
    ctrlrIndex: number = null;

    /** 属性 */
    attri: AttriForEnemy = null;
    /** 减损状态 */
    debuff: DebuffComp = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;
    /** 敌人的子弹属性（这个属性可以自带子子弹） */
    bullet: Bullet = null;

    onLoad() {
        super.onLoad();

        this.attri = this._createComp(AttriForEnemy);
        this.debuff = this._createComp(DebuffComp);

        this.watchCollider = this._createComp(ObjColliderForWatch);
        this.watchCollider.callback = this.onWatching.bind(this);

        this._createComp(BTComp);

        this.bullet = this._createComp(Bullet);
        this.bullet.needInitAttri = false;

        if (CC_EDITOR) return;

        if (!Enemy.ctrlr)
            Enemy.ctrlr = cc.find("main/enemy_layer").getComponent(EnemyCtrlr);
        if (!Enemy.figureDisplay)
            Enemy.figureDisplay = cc.find("main/figure_layer").getComponent(FigureDisplay);
        if (!Enemy.deathDisplay)
            Enemy.deathDisplay = cc.find("main/death_effect_layer").getComponent(DeathEffectDisplay);
    }

    start() {
        if (this.debugMode && !CC_EDITOR) {
            this.bullet.init(Enemy.ctrlr.node, null, this.attri, this);
        }
    }

    lateUpdate() {
        // 超出地形则会死亡
        if (this.node.y < -1) {
            this.gotoDead(0, null, 0, false);
        }
    }

    init() {
        this.bullet.init(Enemy.ctrlr.node, null, this.attri, this);
    }

    /** 切换场景时候重置 */
    reset(index: number, lv: number) {
        this.ctrlrIndex = index;
        this.attri.resetVar(lv);
        this.bullet.reset({lv: lv, enemy: this});
    }

    /** 切换场景时候隐藏 */
    onHide() {
        this.bullet.clear(this);
    }

    // 子弹 ========================================================

    getSubBullet(name: string): Bullet {
        return this.bullet.getSubBullet(name);
    }

    // 碰撞回调 ------------------------------------------------------------

    _calcHurt(atk: Attack): {death: boolean, dmg: number, crit: boolean} {
        let {death, dmg, crit} = atk.handleDamage(this.attri);
        if (!death && atk.debuff) this.debuff.setDebuff(atk.debuff);
        return {death, dmg, crit};
    }

    _hurt(pos: cc.Vec2, hurtDir: number, atk: Attack, dmg: number, crit: boolean) {
        this.onHurtCallback(hurtDir, dmg, crit);

        // 显示受伤数字
        Enemy.figureDisplay.showFigure(pos, hurtDir, dmg, crit, atk.getAttackColor());
    }

    // 用于子类
    onHurtCallback(hurtDir: number, dmg: number, crit: boolean) {

    }

    _dead(pos: cc.Vec2, hurtDir: number, atk: Attack, dmg: number, crit: boolean) {
        if (atk) Enemy.figureDisplay.showFigure(pos, hurtDir, dmg, crit, atk.getAttackColor());
        Enemy.deathDisplay.showDeathEffect(pos);
        this._reclaim();
    }

    _reclaim() {
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
