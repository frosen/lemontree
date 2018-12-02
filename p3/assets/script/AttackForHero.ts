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

        let hattri = this.attri as AttriForHero;

        if (hattri.fullHpPower > 0 && crit && hattri.hp.get() == hattri.maxHp.get()) {
            dmg *= 1 + hattri.fullHpPower;
        }

        if (hattri.nearDeathPower > 0 && hattri.hp.get() < hattri.maxHp.get() * 0.3) {
            dmg += dmg * (0.4 - hattri.hp.get() / hattri.maxHp.get()) * hattri.nearDeathPower;
        }

        if (hattri.executePower > 0 && attri.hp.get() < attri.maxHp.get() * 0.3) {
            dmg += dmg * 0.15 * hattri.executePower;
        }

        let death = this.handleHp(attri, dmg);
        return {death, dmg, crit};
    }
}
