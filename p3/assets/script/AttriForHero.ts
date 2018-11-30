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

    // 卡片 ========================================================

    /**
     * 36种类型，12种一类，三类分别有1个等级，2个等级，3个等级
     */
    cardList: number[] = [];
    cardListForCheck: number[] = [];

    cardNames: string[] = [
        "doubleJump",
        "dash",
        "jumpingByWall",
        "magnetic",
        "enemyDisplay",
        "fastHitRecovery",
        "trapDefence",
        "energyGettingByEnemy",
        "energyGettingByPot",
        "energyGettingByArea",
        "extraMaxHp",
        "magicPower",
        "itemKeeping",
        "bossSlowing",
        "fullHpPower",
        "nearDeathPower",
        "hpRecoveryPower",
        "extraSpace",
        "learningAbility",
        "debuffResistent",
        "extraAtk",
        "extraMagicAtk",
        "executePower",
        "defence",
        "swordWave",
        "flameSprite",
        "cannon",
        "beeBomb",
        "soulStorage",
        "followMe",
        "rottenApple",
        "burstingArmor",
        "bootsOfSpeed",
        "proofOfStrength",
        "godOfFrost",
        "illusion",
    ];

    /** 增加卡片 */
    addCard(index, resetingCardFunc: boolean = true) {
        let curCardCount = this.cardList[index] + 1;
        this.cardList[index] = curCardCount;
        this.cardListForCheck[index] = curCardCount;

        if (resetingCardFunc) {
            this.resetCardFunc();
        }
    }

    resetCardFunc() {
        for (let index = 0; index < this.cardList.length; index++) {
            let card = this.cardList[index];
            if (this.cardListForCheck[index] != card) { // 检测
                throw new Error("card check wrong!");
            }
            let cardName = this.cardNames[index];
            this[cardName] = card;
        }

        if (this.doubleJump > 0) {
            this.addModificationCall("doubleJump", (a: Attri) => {
                this.maxJumpCount.add(1);
                this.jumpCount.set(this.maxJumpCount.get());
            });
        } else {
            this.removeModificationCall("doubleJump");
        }


    }

    /** 获取尚未获得的卡片的列表 */
    getNoObtainedCards(): number[] {
        let cards: number[] = [];
        for (let index = 0; index < this.cardList.length; index++) {
            const card = this.cardList[index];
            if (index < 12) {
                if (card < 1) cards.push(index);
            } else if (index < 24) {
                if (card < 2) cards.push(index);
            } else {
                if (card < 3) cards.push(index);
            }
        }
        return cards;
    }

    // 特殊能力 1级 ========================================================

    /** 二段跳 st*/
    doubleJump: number = 0;

    /** 冲刺 st*/
    dash: number = 0;

    /** 踩墙反弹跳 fc*/
    jumpingByWall: number = 0;

    /** 磁力吸附金币 fc*/
    magnetic: number = 0;

    /** 地图中显示敌人 fc*/
    enemyDisplay: number = 0;

    /** 硬直恢复 fc*/
    fastHitRecovery: number = 0;

    /** 碰到机关不会硬直 fc*/
    trapDefence: number = 0;

    /** 击中敌人获取能量 fc*/
    energyGettingByEnemy: number = 0;
    /** 击中罐子获取能量 fc*/
    energyGettingByPot: number = 0;
    /** 区域变化获取能量 fc*/
    energyGettingByArea: number = 0;

    /** 额外血量 st*/
    extraMaxHp: number = 0;

    /** 魔法能力 蓄力炮增加蓄力速度，火圈增加半径，跟踪弹减少cd，死亡炸弹增加概率，寒冰增加冰冻时间，分身增加攻击距离 */
    magicPower: number = 0;

    // 特殊能力 2级 ========================================================

    /** 物品效果保留 fc */
    itemKeeping: number = 0;

    /** boss减速 fc */
    bossSlowing: number = 0;

    /** 满血增加伤害 25 50 fc */
    fullHpPower: number = 0;

    /** 濒死增加暴击效果50 15/30以下 fc */
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

    /** 烈焰经理 */
    flameSprite: number = 0;

    /** 加农炮 */
    cannon: number = 0;

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

        // test llytodo
        hattri.atkDmg.set(20);
        hattri.critRate.set(0.03);
        hattri.critDmgRate.set(1.5);

        hattri.magicDmg.set(20);

        hattri.maxJumpCount.set(2);

        hattri.evade.set(0.5);

        this._resetToOrigin(hattri);
        this._resetByAbility(hattri);
    }

    _resetToOrigin(hattri: AttriForHero) {

    }

    _resetByAbility(hattri: AttriForHero) {

    }

    _resetVar(attri: Attri) {
        attri.hp.set(attri.maxHp.get());
    }

    fillJumpAndDashCount() {
        this.jumpCount.set(this.maxJumpCount.get());
        this.dashCount.set(this.maxDashCount.get());
    }
}
