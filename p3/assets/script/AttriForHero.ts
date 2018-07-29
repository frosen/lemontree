// AttriForHero.ts
// 英雄属性
// lly 2017.12.12

const {ccclass, property} = cc._decorator;
import {EcNumber, Attri} from "./Attri";

/** 起跳速度 像素/帧 */
const JumpVelocity: number = 4.5;

export enum CardType {
    /** 成功 */
    suc,
    /** 失败 */
    fail,
    /** 正在执行，用于action节点 */
    running,
    /** 无效果，用于set节点 */
    continue,
}

@ccclass
export default class AttriForHero extends Attri {

    /** 经验值 */
    exp: EcNumber = new EcNumber(0);

    // 各种可升级属性 ========================================================

    /** 力量 */
    strength: EcNumber = new EcNumber(0);
    /** 爆发 */
    explosive: EcNumber = new EcNumber(0);
    /** 耐久 */
    durability: EcNumber = new EcNumber(0);
    /** 敏捷 */
    agility: EcNumber = new EcNumber(0);
    /** 精神 */
    mentality: EcNumber = new EcNumber(0);
    /** 决心 */
    determination: EcNumber = new EcNumber(0);
    /** 洞察 */
    discernment: EcNumber = new EcNumber(0);
    /** 冷静 */
    calmness: EcNumber = new EcNumber(0);

    // 卡片 ========================================================


    // hero特有属性 ========================================================

    /** 闪躲率 */
    evade: EcNumber = new EcNumber(0);

    /** 受伤无敌时间 */
    invcTimeForHurt: EcNumber = new EcNumber(0);

    // 特殊能力 ========================================================

    /** 剩余跳跃数量 */
    jumpCount: EcNumber = new EcNumber(0);
    /** 最大跳跃数量 */
    maxJumpCount: EcNumber = new EcNumber(0);

    /** 剩余冲刺数量 */
    dashCount: EcNumber = new EcNumber(0);
    /** 最大冲刺数量 */
    maxDashCount: EcNumber = new EcNumber(0);

    /** 踩墙反弹跳 */
    jumpingByWall: boolean = false;

    /** 磁力吸附金币 */
    magnetic: boolean = false;

    /** 地图中显示敌人 */
    enemyDisplay: boolean = false;

    /** 硬直恢复 */
    fastHitRecovery: boolean = false;

    /** 落水而不会掉下去次数 */
    waterWalkingCount: EcNumber = new EcNumber(0);
    /** 落水而不会掉下去的最大次数 */
    maxWaterWalkingCount: EcNumber = new EcNumber(0);

    energyGettingByEnemey: boolean = false;
    energyGettingByPot: boolean = false;
    energyGettingByArea: boolean = false;

    onLoad() {
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
        this.atkDmg.set(20);
        this.critRate.set(0.03);
        this.critDmgRate.set(1.5);
        
        this.magicDmg.set(20);

        this.maxJumpCount.set(2);
    }

    fillJumpAndDashCount() {
        this.jumpCount.set(this.maxJumpCount.get());
        this.dashCount.set(this.maxDashCount.get());
    }
}
