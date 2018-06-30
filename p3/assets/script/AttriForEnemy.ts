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
}