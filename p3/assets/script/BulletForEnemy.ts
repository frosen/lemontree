// BulletForEnemy.ts
// 敌人的子弹
// lly 2018.10.7

const {ccclass, property} = cc._decorator;

import Bullet from "./Bullet";
import Enemy from "./Enemy";
import {Attri} from "./Attri";

@ccclass
export default class BulletForEnemy extends Bullet {

    /** 如果不为空则又是子弹又是敌人 */
    enemy: Enemy = null;

    onLoad() {
        super.onLoad();
        this.enemy = this.getComponent(Enemy);
    }

    init(attri: Attri) {
        super.init(attri);
        if (this.enemy) {
            this.enemy.initBullet();
        }
    }

    reset(lv: number) {
        super.reset(lv);
        if (this.enemy) {
            this.enemy.reset(-1, lv); // -1则可以不受ctrlr的控制
        }
    }

    clear() {
        super.clear();
        if (this.enemy) {
            this.enemy.onHide();
        }
    }
}
