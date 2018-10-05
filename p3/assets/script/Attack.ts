// Attack.ts
// 表示有伤害的对象：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import {Attri} from "./Attri";
import {Debuff} from "./Debuff";

@ccclass
export default class Attack extends MyComponent {

    /** 索引，用于区分不同的攻击
     * 目前只是敌人的攻击需要，同种攻击在一定时间内不会伤害第二次，
     * hero被攻击有无敌时间所以不需要
    */
    @property
    index: number = 0;

    /** 对象属性，攻击计算需要 */
    @property(Attri)
    attri: Attri = null;

    @property
    magicAttack: boolean = false;

    @property
    hidingAtBeginning : boolean = false;

    /** 本次攻击会引起的减损状态 */
    debuff: Debuff = null;

    /** 攻击回调 */
    hitCallback: (atk: Attack, node: cc.Node, death: boolean, dmg: number, crit: boolean) => void = null;

    onLoad() {
        if (this.attri == null) {
            let n = this.node;
            while (true) {
                let attri = n.getComponent(Attri);
                if (attri != null) {
                    this.attri = attri;
                    break;
                } else {
                    n = n.parent;
                }
            }
        }
        cc.assert(this.attri != null, "attack need attri");

        if (this.hidingAtBeginning) this.enabled = false;
    }

    // 计算基础伤害
    getDamage(): {dmg: number, crit: boolean} {
        let dmg: number;
        let crit: boolean = false;
        if (this.magicAttack) {
            dmg = this.attri.magicDmg.get();
            if (this.attri.energy.get() > 0) {
                let r = Math.random();
                crit = r < 0.75; // 魔法暴击率和暴击伤害倍数固定
                if (crit) {
                    dmg *= 3;
                    this.attri.energy.sub(1);
                }
            }
        } else {
            dmg = this.attri.atkDmg.get();
            let r = Math.random();
            crit = r < this.attri.critRate.get();
            if (crit) dmg *= this.attri.critDmgRate.get();
        }

        // 伤害从0.8到1.2浮动
        let r2 = Math.random();
        let rate = 0.8 + r2 * 0.4;
        dmg *= rate;

        return {dmg, crit};
    }

    _handleDamage(attri: Attri, dmg: number): boolean {
        attri.hp.sub(dmg);
        return attri.hp.get() <= 0;
    }

    handleDamage(attri: Attri): {death: boolean, dmg: number, crit: boolean} {
        let {dmg, crit} = this.getDamage();
        let death = this._handleDamage(attri, dmg);
        return {death, dmg, crit};
    }

    changeIndex() {
        this.index += 10000;
        if (this.index > 100000) this.index = this.index % 1000;
    }

    executeHitCallback(node: cc.Node, death: boolean, dmg: number, crit: boolean) {
        if (this.hitCallback) this.hitCallback(this, node, death, dmg, crit);
    }

    getAttackColor(): cc.Color {
        return this.magicAttack ? cc.Color.BLUE : cc.Color.RED;
    }
}
