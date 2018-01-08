// AttriForHero.ts
// 英雄属性
// lly 2017.12.12

/** 起跳速度 像素/帧 */
const JumpVelocity: number = 3;

export default class AttriForHero {
    /** 血量 */
    hp: number = 0;

    /** x方向速度 */
    xSpeed: number = 0;
    /** y方向速度 */
    ySpeed: number = JumpVelocity;

    /** 剩余跳跃数量 */
    jumpCount: number = 1;
    /** 最大跳跃数量 */
    maxJumpCount: number = 2;

    /** 剩余冲刺数量 */
    dashCount: number = 1;
    /** 最大冲刺数量 */
    maxDashCount: number = 1;

    constructor() {
        this.hp = 100;
        this.xSpeed = 3;
    }

    fillJumpAndDashCount() {
        this.jumpCount = this.maxJumpCount;
        this.dashCount = this.maxDashCount;
    }
}
