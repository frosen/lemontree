// BulletForEnemy.ts
// 敌人的子弹
// lly 2018.10.7

const {ccclass, property} = cc._decorator;

import Bullet from "./Bullet";
import Enemy from "./Enemy";

@ccclass
export default class BulletForEnemy extends Bullet {

    /** 如果不为空则又是子弹又是敌人 */
    enemy: Enemy = null;

    onLoad() {
        super.onLoad();

        this.enemy = this.getComponent(Enemy);
    }

    init() {
        super.init();
        if (this.enemy) {
            this.enemy.initBullet();
        }
    }

    clear() {
        super.clear();

        if (this.enemy) {
            this.enemy.onHide();
        }
    }
}
