// Enemy.ts
// 敌人类：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import MovableObject from "./MovableObject";
import Attack from "./Attack";
import ObjCollision from "./ObjCollision";

@ccclass
export default class Enemy extends cc.Component {

    onLoad() {
        // init logic
        requireComponents(this, [Attack, ObjCollision]);
    }
}
