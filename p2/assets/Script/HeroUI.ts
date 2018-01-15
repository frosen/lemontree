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

    xUIDirs: {[key: number]: number;} = {};

    onLoad() {
        this.xUIDirs[UIDirLvType.move] = 1;
        this.xUIDirs[UIDirLvType.attack] = 0;
        this.xUIDirs[UIDirLvType.hurt] = 0;
    }

    /**
     * 设置不同指标的x方向
     * 此方向有三个指标，当存在hurt时，只使用hurt，否则使用attack的方向，最后才使用move的方向
     * @param dir: 1向右 -1向左 0停止
     * @param lv: 指标
     */
    setXUIDir(dir: number, lv: UIDirLvType) {
        if (dir == 0 && lv == UIDirLvType.move) return;
        this.xUIDirs[lv] = dir;

        // 根据三个指标调整ui方向，ui默认朝向右边
        let realDir = this.xUIDir;
        if (realDir != 0) {
            this.node.scaleX = Math.abs(this.node.scaleX) * realDir;
        }
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
        cc.log("ui -------> stand");
    }

    jumpUp() {
        cc.log("ui -------> jumpUp");
    }

    jumpDown() {
        cc.log("ui -------> jumpDown");
    }

    move() {
        cc.log("ui -------> move");
    }

    dash() {
        cc.log("ui -------> dash");
    }

    hurt() {
        cc.log("ui -------> hurt");
    }
}