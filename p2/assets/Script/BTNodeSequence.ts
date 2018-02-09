// BTNodeSequence.ts
// 行为树节点，顺序节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";

@ccclass
export default class BTNodeSequence extends BTNode {

    typeString: string = "Sequence";

    excute(): BTResult {
        // 遍历子节点执行其行为
        for (const node of this.node.children) {
            let btNode = node.getComponent(BTNode);
            let result: BTResult = btNode.excute();
            if (result == BTResult.fail) {
                return BTResult.fail; // 一旦有失败则直接返回而不往后执行
            }
        }

        return BTResult.suc;
    }

    getBTName(): string {
        return "";
    }
}
