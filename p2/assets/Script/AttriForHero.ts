// AttriForHero.ts
// 英雄属性
// lly 2017.12.12

const {ccclass, property} = cc._decorator;
import {EcNumber, Attri} from "./Attri";

/** 起跳速度 像素/帧 */
const JumpVelocity: number = 4.5;

@ccclass
export default class AttriForHero extends Attri {

    /** 经验值 */
    exp: EcNumber = new EcNumber(0);

    /** 闪躲率 */
    evade: EcNumber = new EcNumber(0);

    /** 剩余跳跃数量 */
    jumpCount: EcNumber = new EcNumber(0);
    /** 最大跳跃数量 */
    maxJumpCount: EcNumber = new EcNumber(0);

    /** 剩余冲刺数量 */
    dashCount: EcNumber = new EcNumber(0);
    /** 最大冲刺数量 */
    maxDashCount: EcNumber = new EcNumber(0);

    /** 受伤无敌时间 */
    invcTimeForHurt: EcNumber = new EcNumber(0);

    onLoad() {
        this.hp.addSetCallback((v: number): number => {
            return Math.max(Math.min(v, this.maxHp.get()), 0);
        });

        this.maxHp.addAfterSetCallback((v: number) => {
            this.hp.set(v);
        });

        // 初始值
        this.jumpCount.set(1);
        this.maxJumpCount.set(1);
        this.dashCount.set(1);
        this.maxDashCount.set(1);
        this.invcTimeForHurt.set(0.5);

        this.maxHp.set(100);
        this.xSpeed.set(3);
        this.ySpeed.set(JumpVelocity);

        // test
        this.critRate.set(0.03);
        this.critDmgRate.set(1.5);
        this.atkDmg.set(20);
        this.magicDmg.set(20);
        this.maxJumpCount.set(2);
    }

    fillJumpAndDashCount() {
        this.jumpCount.set(this.maxJumpCount.get());
        this.dashCount.set(this.maxDashCount.get());
    }
}
