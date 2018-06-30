// Attri.ts
// 属性
// lly 2018.3.12

const {ccclass, property} = cc._decorator;

const MagicNum = Math.floor(Math.random() * 10000);

// 加密数据
export class EcNumber {
    _v: number = 0;
    _onSetList: ((v: number) => number)[] = [];
    _afterSetList: ((v: number) => void)[] = [];
    _onGetList: ((v: number) => number)[] = [];

    constructor(v: number) {
        this.set(v);
    }

    _set(v: number) {
        this._v = MagicNum - v;
    }

    _get() {
        return MagicNum - this._v;
    }

    set(v: number) {
        for (const call of this._onSetList) {
            v = call(v);
        }
        this._set(v);
        for (const call of this._afterSetList) {
            call(v);
        }
    }

    get(): number {
        let v = this._get();
        for (const call of this._onGetList) {
            v = call(v);
        }
        return v;
    }

    add(v: number) {
        this.set(this._get() + v);
    }

    addSetCallback(c: (v: number) => number) {
        this._onSetList.push(c);
    }

    addAfterSetCallback(c: (v: number) => void) {
        this._afterSetList.push(c);
    }

    addGetCallback(c: (v: number) => number) {
        this._onGetList.push(c);
    }
}

@ccclass
export class Attri extends cc.Component {
    /** 血量 */
    hp: EcNumber = new EcNumber(0);
    /** 血量上限 */
    maxHp: EcNumber = new EcNumber(0);

    /** 物理攻击伤害 */
    atkDmg: EcNumber = new EcNumber(0);
    /** 暴击率 */
    critRate: EcNumber = new EcNumber(0);
    /** 暴击伤害比率 */
    critDmgRate: EcNumber = new EcNumber(0);

    /** 魔法攻击伤害 */
    magicDmg: EcNumber = new EcNumber(0);
    /** 暴击率 */
    magicCritRate: EcNumber = new EcNumber(0);
    /** 暴击伤害比率 */
    magicCritDmgRate: EcNumber = new EcNumber(0);
    
    /** x方向速度 */
    xSpeed: EcNumber = new EcNumber(0);
    /** y方向速度 */
    ySpeed: EcNumber = new EcNumber(0);
}