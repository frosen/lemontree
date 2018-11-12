// SwordWave.ts
// hero剑气
// lly 2018.11.7

const {ccclass, property} = cc._decorator;

import BulletForEffect from "../script/BulletForEffect";
import {MovableObject} from "../script/MovableObject";

const SPEED: number = 3;

@ccclass
export default class SwordWave extends BulletForEffect {

    mobj: MovableObject = null;

    onLoad() {
        super.onLoad();
        this.mobj = this.getComponent(MovableObject);
    }

    begin(dir: number) {
        this.doEffect();
        this.node.scaleX = dir;
        this.mobj.xVelocity = dir * SPEED;
    }
}