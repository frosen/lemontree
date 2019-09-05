// EnemyOfWard.ts
// 守卫，也就是固定炮台：
// lly 2018.3.27

const { ccclass, property } = cc._decorator;

import Enemy from '../script/Enemy';
import BulletToFront from './BulletToFront';

@ccclass
export default class Ward extends Enemy {
    // UI相关 ========================================================

    // 基本行动 ========================================================

    turnAround() {
        this.node.scaleX *= -1;
    }

    fire() {
        let pos = this.getCenterPos();
        pos.x += this.node.scaleX * 10;

        let b: BulletToFront = this.getSubBullet('a_bulletToFront') as BulletToFront;
        b.node.setPosition(pos);
        b.begin(this.node.scaleX);
    }
}
