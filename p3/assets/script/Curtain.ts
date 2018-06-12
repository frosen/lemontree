// Curtain.ts
// 帷幕，切换场景时候用的遮罩
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameCtrlr extends cc.Component {

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    onLoad() {
        this.sp.node.active = true;
    }

    start() {
        this.hide();
    }

    hide() {
        this.sp.node.runAction(cc.moveBy(1, 0, 500));
    }
}
