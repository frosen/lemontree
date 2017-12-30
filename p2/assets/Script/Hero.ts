// Hero.ts
// 英雄：
// 控制影响的动作
// lly 2017.12.12

const {ccclass, property, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";
import HeroAttri from './HeroAttri';

/** 起跳速度 */
const JumpVelocity: number = 5;

@ccclass
@requireComponent(MovableObject)
export default class Hero extends cc.Component {

    /** x轴移动方向 */
    xDir: number = 0;
    /** 英雄属性 */
    heroAttri: HeroAttri = null;

    onLoad() {
        // init logic
        this.heroAttri = new HeroAttri();
    }

    update() {
        // 持续不断的速度，所以放在update中
        this.getComponent(MovableObject).setInitialVelocity(this.xDir * this.heroAttri.speed, null);
    }

    // 动作 -------------------------------------------------
 
    /**
     * 移动
     * @param dir: 1向右 -1向左 0停止
     */
    move(dir: number) {
        this.xDir = dir;
    }

    /**
     * 冲刺
     * @param dir: 1向右 -1向左 不能为0
     */
    dash(dir: number) {

    }

    /**
     * 跳跃
     */
    jump() {
        this.getComponent(MovableObject).setInitialVelocity(null, JumpVelocity);
    }

    /**
     * 使用（拾起药水>进入门>下跳）
     */
    use() {

    }
}
