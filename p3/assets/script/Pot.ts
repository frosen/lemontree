// Pot.ts
// 水罐就是场景中的可破坏物：被hero击中会被破坏
// lly 2018.5.12

const { ccclass, property, executeInEditMode } = cc._decorator;

import Destroyee from './Destroyee';
import PotCtrlr from './PotCtrlr';
import PotFragmentCtrlr from './PotFragmentCtrlr';
import { ItemCtrlr, ItemSource } from './ItemCtrlr';

import Attack from './Attack';

@ccclass
@executeInEditMode
export default class Pot extends Destroyee {
    hp: number = 0;

    static potCtrlr: PotCtrlr = null;
    static fragmentCtrlr: PotFragmentCtrlr = null;
    static itemCtrlr: ItemCtrlr = null;

    ctrlrIndex: number = null;
    sp: cc.Sprite = null;

    /** 爆炸时碎片的颜色 */
    c1: cc.Color = null;
    /** 爆炸时碎片的颜色 副颜色 */
    c2: cc.Color = null;

    onLoad() {
        super.onLoad();

        this.sp = this._createComp(cc.Sprite);

        if (CC_EDITOR) return;

        if (!Pot.potCtrlr) Pot.potCtrlr = cc.find('main/pot_layer').getComponent(PotCtrlr);
        if (!Pot.fragmentCtrlr) Pot.fragmentCtrlr = cc.find('main/fragment_layer').getComponent(PotFragmentCtrlr);
        if (!Pot.itemCtrlr) Pot.itemCtrlr = cc.find('main/item_layer').getComponent(ItemCtrlr);

        this.hp = Math.floor(Math.random() * 3) + 1; //随机1-3
    }

    setData(index: number, f: cc.SpriteFrame, c1: cc.Color, c2: cc.Color) {
        this.ctrlrIndex = index;
        this.sp.spriteFrame = f;
        this.c1 = c1;
        this.c2 = c2;
    }

    // 碰撞回调 ------------------------------------------------------------

    _calcHurt(atk: Attack): { death: boolean; dmg: number; crit: boolean } {
        this.hp -= 1;
        let death = this.hp <= 0;
        return { death: death, dmg: 1, crit: false };
    }

    _hurt() {}

    _dead(pos: cc.Vec2, hurtDir: number, atk: Attack, dmg: number, crit: boolean) {
        Pot.fragmentCtrlr.showFragments(pos, this.c1, this.c2);
        Pot.itemCtrlr.createItem(pos, ItemSource.pot, false);
        Pot.potCtrlr.killPot(this);
    }
}
