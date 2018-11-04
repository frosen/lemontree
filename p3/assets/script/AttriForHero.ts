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

    _cardArray: number[] = [];
    _cardArrayForCheck: number[] = [];

    /**
     * 设置卡片状态
     * @param index 从1开始
     * @param 0是没有，1往后是有
     */
    setCardState(index: number, s: number) {
        this._cardArray[index] = s;
        this._cardArrayForCheck[index] = s;
    }

    /**
     * 获取卡片状态
     * @param index 从1开始
     */
    getCardState(index: number): number {
        let card = this._cardArray[index];
        if (card == undefined) return 0;

        if (this._cardArrayForCheck[index] != card) {
            throw new Error("card check wrong!");
        }

        return card;
    }

    // hero特有属性 ========================================================

    /** 闪躲率 */
    evade: EcNumber = new EcNumber(0);
    /** 冲刺时候的闪躲率 */
    dashEvade: EcNumber = new EcNumber(0);

    /** 受伤无敌时间 */
    invcTimeForHurt: EcNumber = new EcNumber(0);

    /** 剩余跳跃数量 */
    jumpCount: EcNumber = new EcNumber(0);
    /** 最大跳跃数量 */
    maxJumpCount: EcNumber = new EcNumber(0);

    /** 剩余冲刺数量 */
    dashCount: EcNumber = new EcNumber(0);
    /** 最大冲刺数量 */
    maxDashCount: EcNumber = new EcNumber(0);

    // 特殊能力 1级 ========================================================

    doubleJump: boolean = false;

    dash: boolean = false;

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

    executePower: number = 0;

    defence: number = 0;

    // 特殊能力 3级 ========================================================

    /** 大真理之剑 */
    swordWave: number = 0;

    /** 加农炮 */
    cannon: number = 0;

    /** 烈焰经理 */
    flameSprite: number = 0;

    /** 小蜜蜂炸弹 */
    beeBomb: number = 0;

    /** 灵魂储藏器 */
    soulStorage: number = 0;

    /** 跟我走炸弹 */
    followMe: number = 0;

    /** 腐烂苹果 */
    rottenApple: number = 0;

    /** 爆裂之甲 */
    burstingArmor: number = 0;

    /** 飞行鞋 */
    bootsOfSpeed: number = 0;

    /** 实力的证明 */
    proofOfStrength: number = 0;

    /** 霜冻之神 */
    godOfFrost: number = 0;

    /** 幻象 */
    illusion: number = 0;

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
