// CanvasCtrlr.ts
// 主要用于适配不同的分辨率
// lly 2018.1.1

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";

@ccclass
export default class CanvasCtrlr extends MyComponent {

    onLoad() {
        let canvas: cc.Canvas = this.getComponent(cc.Canvas);
        let resolution = canvas.designResolution;
        let viewSize = cc.view.getFrameSize();

        // 超过设计比例的宽高比（比如iphoneX）则高度不变的拉宽，否则就是宽度不变的拉高
        if (viewSize.width / viewSize.height > resolution.width / resolution.height) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        } else {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }

        // 关闭抗锯齿
        cc.view.enableAntiAlias(false);
    }
}

