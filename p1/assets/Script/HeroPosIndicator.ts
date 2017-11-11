// HeroPosIndicator.ts
// 英雄位置指示
// lly 2017.10.22

const {ccclass, property, requireComponent} = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
export default class HeroPosIndicator extends cc.Component {

    @property(cc.Node)
    heroNode: cc.Node = null;

    @property(cc.Node)
    heroRange: cc.Node = null;

    @property(cc.Node)
    indicatorRange: cc.Node = null;

    rateX: number = 1;
    rateY: number = 1;

    onLoad() {
       this.rateX = this.indicatorRange.width / this.heroRange.width;
       this.rateY = this.indicatorRange.height / this.heroRange.height;
    }

    update() {
        this.node.x = this.heroNode.x * this.rateX;
        this.node.y = this.heroNode.y * this.rateY;
    }
}
