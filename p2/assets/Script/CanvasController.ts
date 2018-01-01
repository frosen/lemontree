// CanvasController.ts
// 主要用于适配不同的分辨率
// lly 2018.1.1

const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {

    onLoad() {
        let canvas: cc.Canvas = this.getComponent(cc.Canvas);
        let viewSize = cc.view.getFrameSize();

        // 超过16/9（比如iphoneX）则高度不变的拉宽，否则就是宽度不变的拉高
        if (viewSize.width / viewSize.height > 1.778) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        } else {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }
    }
}

