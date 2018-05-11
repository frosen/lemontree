// AttriForHero.ts
// 英雄属性
// lly 2017.12.12

const {ccclass, property} = cc._decorator;
import {MagicNum, Attri} from "./Attri";

/** 起跳速度 像素/帧 */
const JumpVelocity: number = 4.5;

@ccclass
export default class AttriForHero extends Attri {

    setHp(value: number) {
        super.setHp(Math.max(Math.min(value, this.getHpMax()), 0));
    }

    setHpMax(value: number) {
        super.setHpMax(value);
        this.setHp(value);
    }

    // 额外属性 ========================================================

    /** 闪躲率 */
    _evade: number = MagicNum;
    setEvade(value: number) {this._evade = MagicNum - value;}
    getEvade(): number {return MagicNum - this._evade;}

    /** 剩余跳跃数量 */
    _jumpCount: number = MagicNum;
    setJumpCount(value: number) {this._jumpCount = MagicNum - value;}
    getJumpCount(): number {return MagicNum - this._jumpCount;}
    /** 最大跳跃数量 */
    _maxJumpCount: number = MagicNum;
    setMaxJumpCount(value: number) {this._maxJumpCount = MagicNum - value;}
    getMaxJumpCount(): number {return MagicNum - this._maxJumpCount;}

    /** 剩余冲刺数量 */
    _dashCount: number = MagicNum;
    setDashCount(value: number) {this._dashCount = MagicNum - value;}
    getDashCount(): number {return MagicNum - this._dashCount;}
    /** 最大冲刺数量 */
    _maxDashCount: number = MagicNum;
    setMaxDashCount(value: number) {this._maxDashCount = MagicNum - value;}
    getMaxDashCount(): number {return MagicNum - this._maxDashCount;}

    /** 受伤无敌时间 */
    _invcTimeForHurt: number = 0;
    setInvcTimeForHurt(value: number) {this._invcTimeForHurt = MagicNum - value;}
    getInvcTimeForHurt(): number {return MagicNum - this._invcTimeForHurt;}

    onLoad() {
        super.onLoad();

        this.setEvade(0);
        this.setJumpCount(1);
        this.setMaxJumpCount(1);
        this.setDashCount(1);
        this.setMaxDashCount(1);
        this.setInvcTimeForHurt(0.5);

        this.setHpMax(100);
        this.setXSpeed(3);
        this.setYSpeed(JumpVelocity);

        // test
        this.setCritRate(0.03);
        this.setCritDmgRate(1.5);
        this.setAtkDmg(20);
        this.setMagicDmg(20);
        this.setMaxJumpCount(2);
    }

    fillJumpAndDashCount() {
        this.setJumpCount(this.getMaxJumpCount());
        this.setDashCount(this.getMaxDashCount());
    }
}
