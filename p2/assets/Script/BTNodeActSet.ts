// BTNodeActSet.ts
// 行为树节点，设置节点，类似action，不过不进入running状态，而是瞬间动作
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTBase from "./BTBase";

@ccclass
export default class BTNodeActSet extends BTNode {

    typeString: string = "SET";

    /** 执行节点 用于在编辑器中设置excuteAttr */
    @property(cc.Node) excuteNode: cc.Node = null;
    /** 执行属性名称 用于在编辑器中设置excuteAttri */
    @property excuteAttriString: string = "";

    /** 当前行为执行组件 */
    excuteComp: cc.Component = null;
    /** 当前行为属性名称 */
    attriString: string = "";

    onLoad() {
        if (!CC_EDITOR) {
            if (!this.excuteNode) {
                let p: cc.Node = this.node.parent;
                while (true) {
                    if (p.getComponent(BTBase)) break;
                    p = p.parent;
                }
                this.excuteNode = p.parent;
            }

            let data = this.excuteAttriString.split(":");
            this.excuteComp = this.excuteNode.getComponent(data[0]);
            myAssert(this.excuteComp, "When get attri: " + this.excuteNode.name + " wrong component: " + data[0]);

            this.attriString = data[1];
            myAssert(this.excuteComp[this.attriString], this.excuteNode.name + " component: " + data[0] + " not have: " + data[1]);
        }
    }

    excute(): BTResult {
        this.doSet();
        return BTResult.continue;
    }

    doSet() {
        this.excuteComp[this.attriString]();
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteAttriString;           
    }
}
