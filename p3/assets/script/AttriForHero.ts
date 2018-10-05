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

    /** 力量 物理攻击力 */
    strength: EcNumber = new EcNumber(0);
    /** 爆发 暴击率 0.01 + 0.005 * 等级 / 暴击效果 150 + 10 * 大等级 */
    explosive: EcNumber = new EcNumber(0);
    /** 耐久 HP (100 + 20 * 小等级) * (大等级 * 0.1 + 1) */
    durability: EcNumber = new EcNumber(0);
    /** 敏捷 物理攻击闪躲率 0.005 * 小等级 / 冲刺时候额外获得闪躲 0.5 * 大等级 闪躲成功后无敌0.3s */
    agility: EcNumber = new EcNumber(0);
    /** 精神 魔法攻击力 */
    mentality: EcNumber = new EcNumber(0);
    /** 决心 消灭敌人回复HP/地图破坏物回复HP (*) 1~100；1~10 */
    determination: EcNumber = new EcNumber(0);
    /** 洞察 经验数量 20+1 /道具几率 */
    discernment: EcNumber = new EcNumber(0);
    /** 冷静 增加被击中后的无敌时间 0.5 + 0.01 * 等级 / 进入地形的无敌时间 等级 * 0.35 */
    calmness: EcNumber = new EcNumber(0);

    // 卡片 ========================================================

    _cardsNum: EcNumber = new EcNumber(0);

    /**
     * 设置卡片是否开启
     * @param index 从1开始
     */
    setCardEnabled(index: number, b: boolean) {
        let k;
        if (b) {
            k = this._cardsNum.get() | (1 << (index - 1));
        } else {
            k = this._cardsNum.get() & (~(1 << (index - 1)));
        }
        this._cardsNum.set(k);
    }

    /**
     * 获取卡片是否开启
     * @param index 从1开始
     */
    isCardEnabled(index: number) {
        return (this._cardsNum.get() & (1 << (index - 1))) != 0;
    }

    // hero特有属性 ========================================================

    /** 闪躲率 */
    evade: EcNumber = new EcNumber(0);
    /** 冲刺时候的闪躲率 */
    dashEvade: EcNumber = new EcNumber(0);

    /** 受伤无敌时间 */
    invcTimeForHurt: EcNumber = new EcNumber(0);

    // 特殊能力 1级 ========================================================

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

    /** 碰到机关不会硬直 */
    trapDefence: boolean = false;

    /** 击中敌人获取能量 */
    energyGettingByEnemy: boolean = false;
    /** 击中罐子获取能量 */
    energyGettingByPot: boolean = false;
    /** 区域变化获取能量 */
    energyGettingByArea: boolean = false;

    /** 额外血量 */
    extraMaxHp: boolean = false;

    /** 魔法能力 蓄力炮增加蓄力速度，火圈增加半径，跟踪弹减少cd，死亡炸弹增加概率，寒冰增加冰冻时间，分身增加攻击距离 */
    magicPower: boolean = false;

    // 特殊能力 2级 ========================================================

    itemKeeping: number = 0;

    bossSlowing: number = 0;

    fullHpPower: number = 0;

    nearDeathPower: number = 0;

    hpRecoveryPower: number = 0;

    extraSpace: number = 0;

    learningAbility: number = 0;

    debuffResistent: number = 0;

    extraAtk: number = 0;

    extraMagicAtk: number = 0;

    executePower: number = 2;

    defence: number = 0;

    // 特殊能力 3级 ========================================================

    // 重置 ========================================================

    _reset(attri: Attri) {

        let hattri: AttriForHero = attri as AttriForHero;

        // 初始值
        hattri.jumpCount.set(1);
        hattri.maxJumpCount.set(1);
        hattri.dashCount.set(1);
        hattri.maxDashCount.set(1);
        hattri.invcTimeForHurt.set(0.5);

        hattri.maxHp.set(100);
        hattri.xSpeed.set(3);
        hattri.ySpeed.set(JumpVelocity);

        // test
        hattri.atkDmg.set(20);
        hattri.critRate.set(0.03);
        hattri.critDmgRate.set(1.5);

        hattri.magicDmg.set(20);

        hattri.maxJumpCount.set(2);

        hattri.evade.set(0.5);
    }

    _resetVar(attri: Attri) {
        attri.hp.set(attri.maxHp.get());
    }

    fillJumpAndDashCount() {
        this.jumpCount.set(this.maxJumpCount.get());
        this.dashCount.set(this.maxDashCount.get());
    }
}
