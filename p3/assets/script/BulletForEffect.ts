// BulletForEffect.ts
// 这是一个和英雄或敌人放在同一层的节点，又英雄/敌人生成
// lly 2018.10.17

const {ccclass, property} = cc._decorator;

import Bullet from "./Bullet";

@ccclass
export default class BulletForEffect extends Bullet {

    anim: cc.Animation = null;

    onLoad() {
        super.onLoad();
        this.anim = this.getComponent(cc.Animation);
        this.anim.on("finished", this._onFinished, this);
    }

    _onFinished() {
        this.reclaimThisBullet();
    }

    doEffect(name: string) {
        this.anim.play(name);
    }

    doEffectAt(pos: cc.Vec2, name: string = null) {
        this.node.setPosition(pos);
        this.doEffect(name);
    }
}