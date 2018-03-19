// BTNodeGroup.ts
// 行为树节点，组合节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";

@ccclass
export default class BTNodeGroup extends BTNode {

    typeString: string = "Composite";

    /** 记录子节点的BtNode，增加遍历效率 */
    btNodes: BTNode[] = [];

    /** 对当前节点的描述，会显示在层级管理器中 */
    @property
    desc: string = "";

    start() {
        for (const child of this.node.children) {
            if (child.active == false) continue;
            let comp = child.getComponent(BTNode);
            this.btNodes.push(comp);
        }
    }

    excute(): BTResult {
        cc.error("need inhert");
        return BTResult.suc;
    }

    getBTName(): string {
        return this.desc;
    }
}