// AttackForHero.ts
// 表示有伤害的对象：
// lly 2018.10.5

const {ccclass, property} = cc._decorator;

import Attack from "./Attack";
import {Attri} from "./Attri";
import AttriForHero from "./AttriForHero";

@ccclass
export default class AttackForHero extends Attack {

    handleDamage(attri: Attri): {death: boolean, dmg: number, crit: boolean} {
        let {dmg, crit} = this.getDamage();

        let executePower = (this.attri as AttriForHero).executePower;
        if (executePower) {
            if (attri.hp.get() < attri.maxHp.get() * 0.3) {
                dmg += dmg * 0.15 * executePower;
            }
        }

        let death = this._handleDamage(attri, dmg);
        return {death, dmg, crit};
    }
}
