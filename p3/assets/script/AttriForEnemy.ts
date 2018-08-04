// AttriForHero.ts
// 英雄属性
// lly 2017.4.4

const {ccclass, property} = cc._decorator;
import {Attri} from "./Attri";

@ccclass
export default class AttriForEnemy extends Attri {

    onLoad() {

        this.hp.set(100);
        this.maxHp.set(100);
        this.critRate.set(0.03);
        this.critDmgRate.set(1.5);
        this.atkDmg.set(20);
        this.magicDmg.set(20);
    }

    _reset(attri: Attri) {

        let eattri: AttriForEnemy = attri as AttriForEnemy;

        eattri.hp.set(100);
        eattri.maxHp.set(100);
        eattri.critRate.set(0.03);
        eattri.critDmgRate.set(1.5);
        eattri.atkDmg.set(20);
        eattri.magicDmg.set(20);
    }

    _resetVar(attri: Attri) {
        attri.hp.set(attri.maxHp.get());
    }

    resetVar(lv: number) {
        this._resetVar(this);
    }
}