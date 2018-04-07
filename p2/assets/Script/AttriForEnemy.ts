// AttriForHero.ts
// 英雄属性
// lly 2017.4.4

const {ccclass, property} = cc._decorator;
import Attri from "./Attri";

@ccclass
export default class AttriForEnemy extends Attri {

    onLoad() {
        this.hp = 1000;
        this.hpMax = 100;

        this.critRate = 0.02;
        this.critDmgRate = 1.5;

        this.atkDmg = 20;
        this.magicDmg = 20;
    }
}