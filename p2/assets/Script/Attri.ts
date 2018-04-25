// Attri.ts
// 属性
// lly 2018.3.12

const {ccclass, property} = cc._decorator;

@ccclass
export default class Attri extends cc.Component {
    /** 血量 */
    hp: number = 0;
    /** 血量上限 */
    hpMax: number = 0;

    /** 物理攻击伤害 */
    atkDmg: number = 0;
    /** 暴击率 */
    critRate: number = 0;
    /** 暴击伤害比率 */
    critDmgRate: number = 0;

    /** 魔法攻击伤害 */
    magicDmg: number = 0;
    /** 暴击率 */
    magicCritRate: number = 0;
    /** 暴击伤害比率 */
    magicCritDmgRate: number = 0;
    

    /** x方向速度 */
    xSpeed: number = 0;
    /** y方向速度 */
    ySpeed: number = 0;

    /** 经验值 */
    exp: number = 0;
}