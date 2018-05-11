// AttriForHero.ts
// 英雄属性
// lly 2017.4.4

const {ccclass, property} = cc._decorator;
import {Attri} from "./Attri";

@ccclass
export default class AttriForEnemy extends Attri {

    onLoad() {
        this.setHp(100);
        this.setHpMax(100);
        this.setCritRate(0.03);
        this.setCritDmgRate(1.5);
        this.setAtkDmg(20);
        this.setMagicDmg(20);
    }
}