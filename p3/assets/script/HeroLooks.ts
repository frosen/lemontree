// HeroLooks.ts
// 表现hero动作UI的类
// lly 2018.1.7

const {ccclass, property} = cc._decorator;

import {Hero} from "./Hero";

/** 控制UI方向的三个指标 */
export enum HeroDirLv {
    move = 0,
    attack = 1,
    hurt = 2, //hurt方向指向hurt来源方向
}

@ccclass
export class HeroLooks extends cc.Component {

    @property(cc.Sprite)
    body: cc.Sprite = null;

    @property(cc.Sprite)
    sword: cc.Sprite = null;

    hero: Hero = null;

    /** 方向列表 */
    xUIDirs: {[key: number]: number;} = {};

    /** 攻击动画 */
    atkAnim: cc.Animation = null;

    onLoad() {
        this.hero = this.getComponent("Hero");

        this.xUIDirs[HeroDirLv.move] = 1;
        this.xUIDirs[HeroDirLv.attack] = 0;
        this.xUIDirs[HeroDirLv.hurt] = 0;

        this.atkAnim = this.getComponent(cc.Animation);

        // 基本设置
        this.node.setCascadeOpacityEnabled(true);       
    }

    /**
     * 设置不同指标的x方向
     * 此方向有三个指标，当存在hurt时，只使用hurt，否则使用attack的方向，最后才使用move的方向
     * @param dir: 1向右 -1向左 0停止
     * @param lv: 指标
     */
    setXUIDir(dir: number, lv: HeroDirLv) {
        if (dir == 0 && lv == HeroDirLv.move) return; // 移动方向没有0，停止时以上次移动方向为当前方向

        // 攻击方向调整要等一次攻击结束 llytodo

        this.xUIDirs[lv] = dir;

        // 根据三个指标调整ui方向，ui默认朝向右边
        if (dir == 0) return;
        let realDir = this.xUIDir;
        this.node.scaleX = Math.abs(this.node.scaleX) * realDir;
    }

    /**
     * 获取UI方向
     * 此方向有三个指标，当存在hurt时，只使用hurt，否则使用attack的方向，最后才使用move的方向
     * @return dir: 1向右 -1向左 0停止
     */
    get xUIDir(): number {
        let hurtDir = this.xUIDirs[HeroDirLv.hurt];
        if (hurtDir != 0) return hurtDir;
        
        let attackDir = this.xUIDirs[HeroDirLv.attack];
        if (attackDir != 0) return attackDir;
        else return this.xUIDirs[HeroDirLv.move];
    }
    
    stand() {
        // cc.log("ui -------> stand");
        this.body.node.skewX = 0;
        this.body.node.skewY = 0;
    }

    endStand() {

    }

    jumpUp() {
        // cc.log("ui -------> jumpUp");
        this.body.node.skewX = 0;
        this.body.node.skewY = 5;

        // 根据
    }

    endJumpUp() {

    }

    jumpDown() {
        // cc.log("ui -------> jumpDown");
        this.body.node.skewX = 0;
        this.body.node.skewY = -5;
    }

    endJumpDown() {

    }

    move() {
        // cc.log("ui -------> move");
        this.body.node.skewX = 5;
        this.body.node.skewY = 0;
    }

    endMove() {

    }

    dash() {
        // cc.log("ui -------> dash");
        this.body.node.skewX = 15;
        this.body.node.skewY = 0;
    }

    endDash() {
        
    }

    hurt() {
        // cc.log("ui -------> hurt");
        this.body.node.skewX = 0;
        this.body.node.skewY = 0;
        this.setInvincibleEnabled(true);
    }

    endHurt() {
        this.setInvincibleEnabled(false);
    }

    // ---------------

    setInvincibleEnabled(on: boolean) {
        this.node.opacity = on ? 100 : 255;
    }

    // ---------------

    /** 跳跃时候的反向气流 */
    showJumpingAirFlow() {

    }

    /** 反墙跳跃时候的反向气流 */
    showJumpingByWallAirFlow() {

    }

    /** 快速硬直恢复时候的闪光 */
    showHitRecovery() {

    }

    //========================================================

    /** 攻击状态中 */
    attacking: boolean = false;
    atkTimes: number = 0; // 挥动次数
    goingToEndAtk: boolean = false;
    goingToTurnDir: number = 0;

    attack(dir: number) {       
        if (!this.attacking) {
            this.attacking = true;
            this.atkTimes = 0;        
            this.atkAnim.play();
            this.goingToEndAtk = false;
            this.setXUIDir(dir, HeroDirLv.attack);
        }

        this.goingToTurnDir = dir;
    }

    endAttack() {
        if (this.attacking) this.goingToEndAtk = true;
    }

    endAttackAtOnce() {
        this.goingToEndAtk = false;
        this.setXUIDir(0, HeroDirLv.attack);
        this.atkAnim.stop();
        this.recoveryNoAtkUI();               
        this.attacking = false;
    }

    /**
     * 接收从动画过来的回调，每次攻击时调用
     * @param type: -1为向下坎 1为向上坎 0为停止
     */
    onUIAttack(t: number) {
        if (t == 0) {
            this.hero.stopAttackLogic();
        } else {
            this.atkTimes++;
            if (this.goingToEndAtk) {
                if (this.atkTimes > 1) this.endAttackAtOnce(); // 第一次挥动不会停止
            } else {
                this.setXUIDir(this.goingToTurnDir, HeroDirLv.attack);
                this.hero.doAttackLogic();
            } 
        }   
    }  

    recoveryNoAtkUI() {
        this.sword.node.position = cc.v2(-8, 15);
        this.sword.node.rotation = 0;
    }
}