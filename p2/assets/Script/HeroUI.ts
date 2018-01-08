// HeroUI.ts
// 表现hero动作UI的类
// lly 2018.1.7

const {ccclass, property} = cc._decorator;

@ccclass
export default class HeroUI extends cc.Component {

    xUIDir: number = 1;

    onLoad() {
        
    }

    setDir(dir: number, lv: number) {

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