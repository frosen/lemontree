// UICtrlr.ts
// 监听Hero的相关属性，控制整个UI界面的显示
// lly 2018.4.12

const { ccclass, property } = cc._decorator;

import MyComponent from './MyComponent';
import { GameCtrlr } from './GameCtrlr';
import { Hero, HeroUsingType } from './Hero';
import AttriForHero from './AttriForHero';

@ccclass
export default class UICtrlr extends MyComponent {
    /** 游戏控制器 */
    game: GameCtrlr = null;

    /** 英雄 */
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

    /** 下方按钮 */
    @property(cc.Button) pickUpBtn: cc.Button = null;
    @property(cc.Button) triggerBtn: cc.Button = null;
    @property(cc.Button) jumpDownBtn: cc.Button = null;
    @property(cc.Button) midGateBtn: cc.Button = null;

    curUsingType: HeroUsingType = null;

    usingBtnEnabled: boolean = true;
    pauseBtnEnabled: boolean = true;

    onLoad() {
        this.game = cc.find('main').getComponent(GameCtrlr);
        this.hero = cc.find('main/hero_layer/s_hero').getComponent(Hero);

        this.attri = this.hero.attri;
    }

    update(_: number) {
        let hp = this.attri.hp.get();
        if (this.hpNum != hp) {
            this.hpNum = hp;
            this.hpLbl.string = Math.floor(this.hpNum).toString();
        }

        let exp = this.attri.exp.get();
        if (this.expNum != exp) {
            this.expNum = exp;
            this.expLbl.string = this.expNum.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        }
    }

    showUsingButton(t: HeroUsingType) {
        if (!this.usingBtnEnabled) return;
        if (this.curUsingType == t) return;

        if (this.curUsingType != null) {
            let curBtn = this._getUsingBtnByType(this.curUsingType);
            curBtn.node.stopAllActions();
            curBtn.node.runAction(cc.moveTo(0.2, 0, 0).easing(cc.easeCubicActionIn()));
        }

        this.curUsingType = t;

        if (this.curUsingType != null) {
            let nextBtn = this._getUsingBtnByType(this.curUsingType);
            nextBtn.node.stopAllActions();
            nextBtn.node.runAction(cc.moveTo(0.2, 0, 60).easing(cc.easeCubicActionOut()));
        }
    }

    _getUsingBtnByType(t: HeroUsingType): cc.Button {
        switch (t) {
            case HeroUsingType.pickUp:
                return this.pickUpBtn;
            case HeroUsingType.trigger:
                return this.triggerBtn;
            case HeroUsingType.jumpDown:
                return this.jumpDownBtn;
            case HeroUsingType.midGate:
                return this.midGateBtn;
        }
        return null;
    }

    setUsingBtnEnabled(b: boolean) {
        if (!b) {
            this.showUsingButton(null);
        }
        this.usingBtnEnabled = b;
    }

    setPauseBtnEnabled(b: boolean) {
        this.pauseBtnEnabled = b;
    }

    // 按钮回调

    use() {
        if (!this.usingBtnEnabled) return;
        this.hero.use();
    }

    pause() {
        if (!this.pauseBtnEnabled) return;
        this.game.pauseOrResume();
    }
}
