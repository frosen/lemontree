// BTBase.ts
// 行为树基础类，
// 遍历其所有子节点，每个子节点必须是行为树节点
// 会隐藏其所有子节点，提高渲染效率
// 
// lly 2018.2.5

const {ccclass, property, executionOrder} = cc._decorator;

import {BTNode} from "./BTNode";

@ccclass
@executionOrder(EXECUTION_ORDER.BehaviorTree)
export default class BTBase extends cc.Component {

    // 在每个子节点执行完其onload后隐藏
    start() {
        for (const node of this.node.children) {
            node.active = false;
        }
    }

    update(dt: number) {
        // 遍历子节点执行其行为
        for (const node of this.node.children) {
            let btNode = node.getComponent(BTNode);
            btNode.excute();
        }
    }
}
