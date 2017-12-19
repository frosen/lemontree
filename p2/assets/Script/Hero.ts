// Hero.ts
// 英雄：
// 控制影响的动作
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import HeroAttri from './HeroAttri';

/** 也是为了避免卡顿时候的穿墙事件 */
const SpeedMax: number = 2000;
/** 起跳速度 */
const JumpSpeed: number = 800;

@ccclass
export default class Hero extends cc.Component {

    direction: number = 0;
    heroAttri: HeroAttri = null;

    onLoad() {
        // init logic
        this.heroAttri = new HeroAttri();
    }

    // 动作 -------------------------------------------------
 
    /**
     * 移动
     * @param dir: 1向右 -1向左 0停止
     */
    move(dir: number) {
        this.direction = dir;
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
        this.node.y += JumpSpeed; // 改变当前帧的y轴位置，通过和上一帧的差值可视为跳跃
    }

    /**
     * 使用（拾起药水>进入门>下跳）
     */
    use() {

    }

    // -------------------------------------------------

    update(dt: number) {
        // 移动
        if (this.direction != 0) {
            let xSpeed = this.heroAttri.speed * this.direction;
            this.node.x += Math.min(xSpeed, SpeedMax) * dt;
        }
    }
}
