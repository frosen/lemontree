// AttriForHero.ts
// 英雄属性
// lly 2017.12.12

/** 起跳速度 */
const JumpVelocity: number = 3;

export default class AttriForHero {
    hp: number = 0;

    xSpeed: number = 0;
    ySpeed: number = JumpVelocity;


    jumpCount: number = 1;
    maxJumpCount: number = 1;

    constructor() {
        this.hp = 100;
        this.xSpeed = 3;
    }

    fillJumpCount() {
        this.jumpCount = this.maxJumpCount;
    }
}
