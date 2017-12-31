// Hero.ts
// 英雄：
// 控制影响的动作
// lly 2017.12.12

const {ccclass, property, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";
import HeroAttri from './HeroAttri';

/** 起跳速度 */
const JumpVelocity: number = 7;

@ccclass
@requireComponent(MovableObject)
export default class Hero extends cc.Component {

    /** 英雄属性 */
    heroAttri: HeroAttri = null;
    /** 可移动对象组件 */
    movableObj: MovableObject = null;

    /** x轴移动方向 */
    xDir: number = 0;

    onLoad() {
        // init logic
        this.heroAttri = new HeroAttri();
        this.movableObj = this.getComponent(MovableObject);
    }

    update() {
        // 持续不断的速度，所以放在update中
        this.movableObj.setInitialVelocity(this.xDir * this.heroAttri.speed, null);
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
        this.movableObj.setInitialVelocity(null, JumpVelocity);
    }

    /**
     * 使用（拾起药水>进入门>下跳）
     */
    use() {
        this.node.y -= 2;
    }
}
