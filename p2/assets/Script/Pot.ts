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

    onLoad() {
        super.onLoad();

        this._createComp(MovableObject);
        this._createComp(TerrainCollider);
        this._createComp(Gravity);
        this._createComp(cc.Sprite);

        if (CC_EDITOR) return;

        this.ctrlr = cc.find("main/fragment_layer").getComponent(PotFragmentCtrlr);

        this.hp = Math.floor(Math.random() * 3) + 1; //随机1-3 
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
        this.ctrlr.showFragments(pos, cc.Color.RED, cc.Color.WHITE);
    }
}

