// HeroUI.ts
// 表现hero动作UI的类
// lly 2018.1.7

const {ccclass, property} = cc._decorator;

/** 控制UI方向的三个指标 */
export enum UIDirLvType {
    move = 0,
    attack = 1,
    hurt = 2, //hurt方向指向hurt来源方向
}

@ccclass
export class HeroUI extends cc.Component {

    @property(cc.Sprite)
    body: cc.Sprite = null;

    xUIDirs: {[key: number]: number;} = {};

    onLoad() {
        this.xUIDirs[UIDirLvType.move] = 1;
        this.xUIDirs[UIDirLvType.attack] = 0;
        this.xUIDirs[UIDirLvType.hurt] = 0;

        // 基本设置
        this.node.setCascadeOpacityEnabled(true);
    }

    /**
     * 设置不同指标的x方向
     * 此方向有三个指标，当存在hurt时，只使用hurt，否则使用attack的方向，最后才使用move的方向
     * @param dir: 1向右 -1向左 0停止
     * @param lv: 指标
     */
    setXUIDir(dir: number, lv: UIDirLvType) {
        if (dir == 0 && lv == UIDirLvType.move) return; // 移动方向没有0，停止时以上次移动方向为当前方向

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
        let hurtDir = this.xUIDirs[UIDirLvType.hurt];
        if (hurtDir != 0) return hurtDir;
        
        let attackDir = this.xUIDirs[UIDirLvType.attack];
        if (attackDir != 0) return attackDir;
        else return this.xUIDirs[UIDirLvType.move];
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

    //========================================================

    attack(dir: number) {
        this.setXUIDir(dir, UIDirLvType.attack);
    }

    endAttack() {
        this.setXUIDir(0, UIDirLvType.attack);
    }
}