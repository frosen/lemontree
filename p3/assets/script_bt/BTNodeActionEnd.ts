// BTNodeActionEnd.ts
// 行为树节点，动作结束节点，当action的running结束时，调用此节点下所有子节点的execute
// 父节点只能为action，子节点的返回结果不起任何作用
//
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import {BTNodeAction} from "./BTNodeAction";
import BTComp from "./BTComp";

@ccclass
export default class BTNodeActionEnd extends BTNode {

    typeString: string = "End Excuting";

    onLoad() {
        // 检测父节点，子节点正确性
        cc.assert(this.node.parent.getComponent(BTNodeAction), "BTNodeActionEnd need action parent");
    }

    getBTName(): string {
        return "";
    }

    execute(comp: BTComp): BTResult {
        cc.error("never use");
        return BTResult.running;
    }


}
