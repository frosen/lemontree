// SwordWave.ts
// hero剑气 物理攻击 攻击id和普通攻击一致并且触发时间一定在hero后面 可以享受到普攻的一些特性
// lly 2018.11.7

const {ccclass, property} = cc._decorator;

import BulletForEffect from "../script/BulletForEffect";
import {MovableObject} from "../script/MovableObject";
import Attack from "../script/Attack";

const SPEED: number = 3;

@ccclass
export default class SwordWave extends BulletForEffect {

    mobj: MovableObject = null;
    atk: Attack = null;

    onLoad() {
        super.onLoad();
        this.mobj = this.getComponent(MovableObject);
        this.atk = this.getComponent(Attack);
    }

    reset(level: number) {
        super.reset(null);
        this.atk.rate = 0.3 * level + 0.2; // 0.5 0.8 1.1
    }

    begin(dir: number, atkIndex: number) {
        this.atk.index = atkIndex;
        this.doEffect();
        this.node.scaleX = dir;
        this.mobj.xVelocity = dir * SPEED;
    }
}