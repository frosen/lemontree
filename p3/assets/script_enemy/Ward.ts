// EnemyOfWard.ts
// 守卫，也就是固定炮台：
// lly 2018.3.27

const {ccclass, property} = cc._decorator;

import Enemy from "../script/Enemy";

@ccclass
export default class Ward extends Enemy {

    // UI相关 ========================================================

    // 基本行动 ========================================================

    turnAround() {
        this.node.scaleX *= -1;
    }
}
