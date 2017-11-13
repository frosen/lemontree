// PosHideHandler.ts
// 某节点移动到相应位置则当前节点会有透明度的调整的逻辑
// lly 2017.11.11

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

@ccclass
export default class PosHideHandler extends cc.Component {

    @property(cc.Node)
    checkNode: cc.Node = null;

    @property()
    hideFrom: number = 0;

    @property()
    hideUntil: number = 0;

    @property()
    opFrom: number = 0;

    @property()
    opUntil: number = 0;

    isChecking: boolean = false;

    onLoad() {
        
    }

    update() {
        let posY = this.checkNode.y;
        
        let op = 255 * (posY - this.hideUntil) / (this.hideFrom - this.hideUntil);
        op = Math.max(this.opUntil, op);
        op = Math.min(this.opFrom, op);

        this.node.opacity = op;
    }
}
