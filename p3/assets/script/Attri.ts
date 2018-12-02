// Attri.ts
// 属性
// lly 2018.3.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";

const MagicNum = Math.floor(Math.random() * 10000);

// 加密数据
export class EcNumber {
    _v: number = 0;
    _vForCheck: number = 0;

    constructor(v: number) {
        this.set(v);
    }

    set(v: number) {
        this._v = v;
        this._vForCheck = MagicNum - v;
    }

    get(): number {
        if (MagicNum - this._v != this._vForCheck) {
            throw new Error("number check wrong!");
        }
        return this._v;
    }

    add(v: number) {
        this.set(this._v + v);
    }

    sub(v: number) {
        this.set(this._v - v);
    }

    multiply(v: number) {
        this.set(this._v * v);
    }

    getHighDigit() {
        return Math.floor(this.get() / 10 + 0.01);
    }
}

@ccclass
export class Attri extends MyComponent {
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
    /** 能量，魔法有能量才能暴击 */
    energy: EcNumber = new EcNumber(0);
    /** 能量上限 */
    maxEnergy: EcNumber = new EcNumber(300);

    /** x方向速度 */
    xSpeed: EcNumber = new EcNumber(0);
    /** y方向速度 */
    ySpeed: EcNumber = new EcNumber(0);

    // 属性数值生成 ========================================================

    modificationCallDict: {[key: string]: {[key: string]: ((Attri) => void)}} = {};

    addModificationCall(category: string, key: string, call: ((Attri) => void)) {
        if (this.modificationCallDict[category] == undefined) {
            this.modificationCallDict[category] = {};
        }
        this.modificationCallDict[category][key] = call;
    }

    removeModificationCall(category: string, key: string = null) {
        if (key == null) {
            this.modificationCallDict[category] = {};
        } else {
            delete this.modificationCallDict[category][key];
        }
    }

    reset(all: boolean = false) {
        this._reset();
        for (const category in this.modificationCallDict) {
            let dict = this.modificationCallDict[category];
            for (const key in dict) {
                let call = dict[key];
                call(this);
            }
        }
        if (all) this._resetVar();
    }

    /** 重置非变量属性 */
    _reset() {}

    /** 重置变量 */
    _resetVar() {}
}