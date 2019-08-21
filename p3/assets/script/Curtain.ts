// Curtain.ts
// 帷幕，切换场景时候用的遮罩
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";

@ccclass
export default class Curtain extends MyComponent {

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    onLoad() {
        this.sp.node.active = true;
    }

    showScene() {
        this.sp.node.runAction(cc.moveBy(1, 0, 500));
    }

    hideScene() {

    }
}
