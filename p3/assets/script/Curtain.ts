// Curtain.ts
// 帷幕，切换场景时候用的遮罩
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";

@ccclass
export default class Curtain extends MyComponent {

    @property(cc.Mask)
    mask: cc.Mask = null;

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    onLoad() {
        this.node.active = false;

        let vSize = cc.view.getVisibleSize();
        this.sp.node.setContentSize(cc.size(vSize.width * 2 + 10, vSize.height * 2 + 10));
    }

    showSceneByFade() {
        // this.sp.node.runAction(cc.moveBy(1, 0, 200));
    }

    showSceneBySquare(pos: cc.Vec2, callback) {
        this.node.active = true;
        this.mask.node.position = pos;

        let maxW = this.sp.node.getContentSize().width * 0.8;
        this.mask.node.setContentSize(cc.size(0, 0));

        // todo 以后用tween代替
        let schFunc;
        schFunc = () => {
            let w = this.mask.node.getContentSize().width + 50;
            this.mask.node.setContentSize(cc.size(w, w));
            if (w >= maxW) {
                this.node.active = false;
                cc.director.getScheduler().unschedule(schFunc, this);
                if (callback) callback();
            }
        };
        cc.director.getScheduler().schedule(schFunc, this, 0, false);
    }

    hideSceneBySquare(pos: cc.Vec2, callback) {
        this.node.active = true;
        this.mask.node.position = pos;

        let w = this.sp.node.getContentSize().width * 0.8;
        this.mask.node.setContentSize(cc.size(w, w));

        // todo 以后用tween代替
        let schFunc;
        schFunc = () => {
            let w = this.mask.node.getContentSize().width - 50;
            this.mask.node.setContentSize(cc.size(w, w));
            if (w <= 0) {
                this.mask.node.setContentSize(cc.size(0, 0));
                cc.director.getScheduler().unschedule(schFunc, this);
                if (callback) callback();
            }
        };
        cc.director.getScheduler().schedule(schFunc, this, 0, false);
    }
}
