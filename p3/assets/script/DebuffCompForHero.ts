// DebuffCompForHero.ts
// 可以带减损效果的组件，转为hero使用
// lly 2018.12.12

const { ccclass, property } = cc._decorator;

import DebuffComp from './DebuffComp';
import { Debuff } from './Debuff';
import AttriForHero from './AttriForHero';

@ccclass
export default class DebuffCompForHero extends DebuffComp {
    attri: AttriForHero = null;

    onLoad() {
        this.attri = cc.find('main/hero_layer/s_hero').getComponent('AttriForHero');
    }

    setDebuff(debuff: Debuff) {
        super.setDebuff(debuff);
        this.curDuration = this.curDuration * (1 - this.attri.debuffResistent * 0.2);
    }
}
