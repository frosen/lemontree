// BGCtrlr.ts
// 背景控制器
// lly 2018.6.20

const {ccclass, property, executionOrder} = cc._decorator;
import { TerrainCtrlr } from "./TerrainCtrlr";

@ccclass
@executionOrder(EXECUTION_ORDER.BGCtrlr)
export default class BGCtrlr extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property(TerrainCtrlr)
    terrain: TerrainCtrlr = null;

    sp: cc.Sprite = null;

    viewWidth: number = null;
    viewHeight: number = null;

    onLoad() {
        requireComponents(this, [cc.Sprite]);

        let canvas: cc.Node = cc.find("canvas");
        this.viewWidth = canvas.getContentSize().width;
        this.viewHeight = canvas.getContentSize().height;

        this.sp = this.getComponent(cc.Sprite);
    }

    update (_: number) {
        let size = this.terrain.terrainSize;
        if (size.width < 1 || size.height < 1) return;

        let rateX = (this.target.x - this.viewWidth / 2) / (size.width - this.viewWidth);
        let rateY = (this.target.y - this.viewHeight / 2) / (size.height - this.viewHeight);

        let x = (size.width - this.node.width) * rateX;
        let y = (size.height - this.node.height) * rateY;

        this.node.x = x;
        this.node.y = y;
    }
}
