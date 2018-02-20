// BTNodeActionUntil.ts
// 行为树节点，意为直到什么时候，action结束，其父节点running时每帧调用其所有子节点，为suc则退出running状态，
// 父节点只能为action，子节点只能为Condition
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeAction from "./BTNodeAction";
import BTNodeCondition from "./BTNodeCondition";

@ccclass
export default class BTNodeActionUntil extends BTNode {

    typeString: string = "Until";

    onLoad() {
        if (!CC_EDITOR) {
            // 检测父节点，子节点正确性
            cc.assert(this.node.parent.getComponent(BTNodeAction), "BTNodeActionEnd need action parent");
            for (const child of this.node.children) {
                cc.assert(child.getComponent(BTNodeCondition), "BTNodeActionEnd need action child");
            }
        }
    }

    getBTName(): string {
        return "";
    }
}
