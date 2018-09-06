// BTNodeActionUntil.ts
// 行为树节点，意为直到什么时候，action结束，其父节点running时每帧调用其所有子节点，[[其中有一个]]为suc则退出running状态，
// 并的关系可以在下面加sequence
// 父节点只能为action
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeAction from "./BTNodeAction";

@ccclass
export default class BTNodeActionUntil extends BTNode {

    typeString: string = "Until";

    onLoad() {
        // 检测父节点，子节点正确性
        cc.assert(this.node.parent.getComponent(BTNodeAction), "BTNodeActionEnd need action parent");
    }

    excute(): BTResult {
        cc.error("never use");
        return BTResult.running;
    }

    getBTName(): string {
        return "";
    }
}
