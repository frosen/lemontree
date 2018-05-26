// BTNodeActionEnd.ts
// 行为树节点，动作结束节点，当action的running结束时，调用此节点下所有子节点的excute
// 父节点只能为action，子节点的返回结果不起任何作用
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeAction from "./BTNodeAction";
import BTNodeActSet from "./BTNodeActSet";

@ccclass
export default class BTNodeActionEnd extends BTNode {

    typeString: string = "End Excuting";

    onLoad() {
        // 检测父节点，子节点正确性
        myAssert(this.node.parent.getComponent(BTNodeAction), "BTNodeActionEnd need action parent");
    }

    excute(): BTResult {
        cc.error("never use");
        return BTResult.running;
    }

    getBTName(): string {
        return "";
    }
}
