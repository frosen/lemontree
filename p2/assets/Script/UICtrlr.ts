// UICtrlr.ts
// 监听Hero的相关属性，控制整个UI界面的显示
// lly 2018.4.12

const {ccclass, property} = cc._decorator;

import {Hero, HeroUsingType} from "./Hero";
import AttriForHero from "./AttriForHero";

@ccclass
export default class UICtrlr extends cc.Component {

    /** 英雄 */
    @property(Hero)
    hero: Hero = null;

    attri: AttriForHero = null;

    /** hp 显示 */
    @property(cc.Label)
    hpLbl: cc.Label = null;
    hpNum: number = 0;

    /** exp 显示 */
    @property(cc.Label)
    expLbl: cc.Label = null;
    expNum: number = 0;

    onLoad() {
        this.attri = this.hero.attri;
    }

    update(_: number) {
        if (this.hpNum != this.attri.hp) {
            this.hpNum = this.attri.hp;           
            this.hpLbl.string = Math.floor(this.hpNum).toString();
        } 

        if (this.expNum != this.attri.exp) {
            this.expNum = this.attri.exp;
            this.expLbl.string = this.expNum.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        }       
    }

    showUsingButton(t: HeroUsingType, b: boolean) {
        
    }
}
