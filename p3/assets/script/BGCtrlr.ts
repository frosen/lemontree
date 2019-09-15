// BGCtrlr.ts
// 背景控制器
// lly 2018.6.20

const { ccclass, property, executionOrder } = cc._decorator;

import MyComponent from './MyComponent';

@ccclass
@executionOrder(EXECUTION_ORDER.BGCtrlr)
export default class BGCtrlr extends MyComponent {
    @property(cc.Node)
    cameraNode: cc.Node = null;

    /** 相对镜头移动背景的比例 */
    rate: number = 0.5;
    /** 背景初始位置的偏移量 */
    offset: number = -1000;

    onLoad() {
        requireComponents(this, [cc.Sprite]);

        let canvas: cc.Node = cc.find('canvas');
        this.node.width = canvas.getContentSize().width * 50;
        this.node.height = canvas.getContentSize().height * 50;
    }

    update(_: number) {
        this.node.x = this.cameraNode.x * this.rate + this.offset;
        this.node.y = this.cameraNode.y * this.rate + this.offset;
    }
}
