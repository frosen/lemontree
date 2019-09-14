// Curtain.ts
// 帷幕，切换场景时候用的遮罩
// lly 2018.5.12

const { ccclass, property } = cc._decorator;

import MyComponent from './MyComponent';

@ccclass
export default class Curtain extends MyComponent {
    @property(cc.Mask)
    mask: cc.Mask = null;

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    onLoad() {
        this.node.active = false;

        let vSize = cc.view.getVisibleSize();
        this.sp.node.setContentSize(cc.size(vSize.width * 3, vSize.height * 3));
    }

    showSceneByFade(pos: cc.Vec2, callback) {
        this.node.active = true;
        this.mask.node.position = pos;
        this.mask.node.opacity = 255;
        this.mask.node.setContentSize(cc.size(0, 0));

        // todo 以后用tween代替
        let schFunc;
        schFunc = () => {
            let o = this.mask.node.opacity - 5;
            o = o < 0 ? 0 : o;
            this.mask.node.opacity = o;
            if (o <= 0) {
                this.node.active = false;
                cc.director.getScheduler().unschedule(schFunc, this);
                if (callback) callback();
            }
        };
        cc.director.getScheduler().schedule(schFunc, this, 0, false);
    }

    hideSceneByFade(pos: cc.Vec2, callback) {
        this.node.active = true;
        this.mask.node.position = pos;
        this.mask.node.opacity = 0;
        this.mask.node.setContentSize(cc.size(0, 0));

        // todo 以后用tween代替
        let schFunc;
        schFunc = () => {
            let o = this.mask.node.opacity + 5;
            o = o > 255 ? 255 : o;
            this.mask.node.opacity = o;
            if (o == 255) {
                cc.director.getScheduler().unschedule(schFunc, this);
                if (callback) callback();
            }
        };
        cc.director.getScheduler().schedule(schFunc, this, 0, false);
    }

    showSceneBySquare(pos: cc.Vec2, callback) {
        this.node.active = true;
        this.mask.node.position = pos;
        this.mask.node.opacity = 255;

        let maxW = this.sp.node.getContentSize().width;
        this.mask.node.setContentSize(cc.size(0, 0));

        // todo 以后用tween代替
        let schFunc;
        schFunc = () => {
            let w = this.mask.node.getContentSize().width + 50;
            w = w > maxW ? maxW : w;
            this.mask.node.setContentSize(cc.size(w, w));
            if (w == maxW) {
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
        this.mask.node.opacity = 255;

        let w = this.sp.node.getContentSize().width;
        this.mask.node.setContentSize(cc.size(w, w));

        // todo 以后用tween代替
        let schFunc;
        schFunc = () => {
            let w = this.mask.node.getContentSize().width - 50;
            w = w < 0 ? 0 : w;
            this.mask.node.setContentSize(cc.size(w, w));
            if (w == 0) {
                this.mask.node.setContentSize(cc.size(0, 0));
                cc.director.getScheduler().unschedule(schFunc, this);
                if (callback) callback();
            }
        };
        cc.director.getScheduler().schedule(schFunc, this, 0, false);
    }
}
