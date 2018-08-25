// BTBase.ts
// 行为树基础类，
// 遍历其所有子节点，每个子节点必须是行为树节点
// 会隐藏其所有子节点，提高渲染效率
// 
// lly 2018.2.5

const {ccclass, property, executionOrder} = cc._decorator;

import MyComponent from "./MyComponent";
import {BTNode, BTResult} from "./BTNode";

@ccclass
@executionOrder(EXECUTION_ORDER.BehaviorTree)
export default class BTBase extends MyComponent {

    /** 记录子节点的BtNode，增加遍历效率 */
    btNodes: BTNode[] = [];
   
    start() {
        // 遍历子节点执行其行为
        for (const node of this.node.children) {
            if (node.active == false) continue;
            let btNode = node.getComponent(BTNode);
            this.btNodes.push(btNode);
        }

        // 在每个子节点执行完其onload后隐藏
        for (const node of this.node.children) {
            node.active = false;
        }
    }

    update(dt: number) {
        this.node.emit("BTUpdate", {dt: dt});

        // 遍历子节点执行其行为
        for (const btNode of this.btNodes) {
            let result = btNode.excute();
            if (result == BTResult.running) btNode.doAction();
        } 
    }
}
