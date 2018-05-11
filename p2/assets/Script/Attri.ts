// Attri.ts
// 属性
// lly 2018.3.12

const {ccclass, property} = cc._decorator;

export const MagicNum = Math.floor(Math.random() * 10000);

@ccclass
export class Attri extends cc.Component {

    /** 血量 */
    _hp: number = 0;
    setHp(value: number) {this._hp = MagicNum - value;}
    getHp(): number {return MagicNum - this._hp;}

    /** 血量上限 */
    _hpMax: number = 0;
    setHpMax(value: number) {this._hpMax = MagicNum - value;}
    getHpMax(): number {return MagicNum - this._hpMax;}

    /** 物理攻击伤害 */
    _atkDmg: number = 0;
    setAtkDmg(value: number) {this._atkDmg = MagicNum - value;}
    getAtkDmg(): number {return MagicNum - this._atkDmg;}
    /** 暴击率 */
    _critRate: number = 0;
    setCritRate(value: number) {this._critRate = MagicNum - value;}
    getCritRate(): number {return MagicNum - this._critRate;}
    /** 暴击伤害比率 */
    _critDmgRate: number = 0;
    setCritDmgRate(value: number) {this._critDmgRate = MagicNum - value;}
    getCritDmgRate(): number {return MagicNum - this._critDmgRate;}

    /** 魔法攻击伤害 */
    _magicDmg: number = 0;
    setMagicDmg(value: number) {this._magicDmg = MagicNum - value;}
    getMagicDmg(): number {return MagicNum - this._magicDmg;}
    /** 暴击率 */
    _magicCritRate: number = 0;
    setMagicCritRate(value: number) {this._magicCritRate = MagicNum - value;}
    getMagicCritRate(): number {return MagicNum - this._magicCritRate;}
    /** 暴击伤害比率 */
    _magicCritDmgRate: number = 0;
    setMagicCritDmgRate(value: number) {this._magicCritDmgRate = MagicNum - value;}
    getMagicCritDmgRate(): number {return MagicNum - this._magicCritDmgRate;}
    
    /** x方向速度 */
    _xSpeed: number = 0;
    setXSpeed(value: number) {this._xSpeed = MagicNum - value;}
    getXSpeed(): number {return MagicNum - this._xSpeed;}
    /** y方向速度 */
    _ySpeed: number = 0;
    setYSpeed(value: number) {this._ySpeed = MagicNum - value;}
    getYSpeed(): number {return MagicNum - this._ySpeed;}

    /** 经验值 */
    _exp: number = 0;
    setExp(value: number) {this._exp = MagicNum - value;}
    getExp(): number {return MagicNum - this._exp;}

    onLoad() {
        this.setHp(0);
        this.setHpMax(0);

        this.setAtkDmg(0);
        this.setCritRate(0);
        this.setCritDmgRate(0);

        this.setMagicDmg(0);
        this.setMagicCritRate(0);
        this.setMagicCritDmgRate(0);

        this.setXSpeed(0);
        this.setYSpeed(0);

        this.setExp(0);
    }
}