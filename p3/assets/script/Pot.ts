// Pot.ts
// 水罐就是场景中的可破坏物：被hero击中会被破坏
// lly 2018.5.12

const {ccclass, property, executeInEditMode} = cc._decorator;

import Destroyee from "./Destroyee";
import PotFragmentCtrlr from "./PotFragmentCtrlr";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import Gravity from "./Gravity";

import Attack from "./Attack";

@ccclass
@executeInEditMode
export default class Pot extends Destroyee {

    hp: number = 0;

    ctrlr: PotFragmentCtrlr = null;

    terrainCollider: TerrainCollider = null;
    sp: cc.Sprite = null;

    /** 爆炸时碎片的颜色 */
    c1: cc.Color = null;
    /** 爆炸时碎片的颜色 副颜色 */
    c2: cc.Color = null;

    onLoad() {
        super.onLoad();

        this._createComp(MovableObject);
        this.terrainCollider = this._createComp(TerrainCollider);
        this._createComp(Gravity);
        this.sp = this._createComp(cc.Sprite);

        if (CC_EDITOR) return;

        this.ctrlr = cc.find("main/fragment_layer").getComponent(PotFragmentCtrlr);

        this.hp = Math.floor(Math.random() * 3) + 1; //随机1-3 
    }

    setData(f: cc.SpriteFrame, c1: cc.Color, c2: cc.Color, w: number) {
        this.sp.spriteFrame = f;
        this.c1 = c1;
        this.c2 = c2;
        let oSize = this.sp.spriteFrame.getOriginalSize();
        this.terrainCollider.size = cc.size(w, oSize.height); 
    }

    // 碰撞回调 ------------------------------------------------------------

    _calcHurt(atk: Attack): {death: boolean, dmg: number, crit: boolean} {
        this.hp -= 1;       
        let death = this.hp <= 0;
        return {death: death, dmg: 1, crit: false};
    }

    _hurt() {
        
    }

    _dead(pos: cc.Vec2) {
        this.ctrlr.showFragments(pos, this.c1, this.c2);
    }
}

