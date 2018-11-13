// FlameSprite.ts
// 围绕hero的火球
// lly 2018.11.7

const {ccclass, property} = cc._decorator;

import Bullet from "../script/Bullet";
import {MovableObject} from "../script/MovableObject";
import Attack from "../script/Attack";
import { Hero } from "../script/Hero";

const SPEED: number = 3;

@ccclass
export default class FlameSprite extends Bullet {

    hero: Hero = null;
    mobj: MovableObject = null;
    flames: cc.Node[] = [];

    onLoad() {
        super.onLoad();
        this.mobj = this.getComponent(MovableObject);

        for (let index = 0; index < 4; index++) {
            let flame = this.node.getChildByName("flame" + index.toString());
            this.flames.push(flame);
        }
    }

    update(_: number) {
        this.node.position = cc.v2(this.hero.node.x, this.hero.node.y + 16);
        this.node.rotation += 1.3;
    }

    reset(data: {level: number, hero: Hero}) {
        super.reset(null);
        this.hero = data.hero;

        if (data.level > 0) {
            this.useThisBullet();

            this.flames[0].active = (data.level == 2);

            this.flames[2].active = (data.level == 3);
            this.flames[3].active = (data.level == 3);

        } else {
            this.reclaimThisBullet();
        }
    }
}