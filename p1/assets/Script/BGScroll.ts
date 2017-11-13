// BGScroll.ts
// 滚动背景
// lly 2017.11.11

const {ccclass, property} = cc._decorator;

@ccclass
export default class BGScroll extends cc.Component {

    @property([cc.Node])
    movingNodes: cc.Node[] = [];

    lastNode: cc.Node = null;

    onLoad() {
        let h = 0;
        for (let node of this.movingNodes) {
            node.x = 0;
            node.y = h;
            h += node.height;
            this.lastNode = node;
        }
    }

    update() {
        this.moveNode();
    }

    speed: number = -2;
    moveNode() {
        for (let node of this.movingNodes) {
            node.y += this.speed;
            
            if (node.y + node.height < 0) {
                node.y = this.lastNode.y + this.lastNode.height;
                this.lastNode = node;
            }
        }
    }
}
