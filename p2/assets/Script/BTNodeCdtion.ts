// BTNodeCdtion.ts
// 行为树节点，条件节点的基类，需要继承
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTBase from "./BTBase";

@ccclass
export default class BTNodeCdtion extends BTNode {

    typeString: string = "IF";

    /** 执行节点 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property(cc.Node) excuteNode: cc.Node = null;
    /** 执行函数名称 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property excuteFuncString: string = "";

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
            this.createExcuteFunc(this.excuteNode, this.excuteFuncString);
        }
    }

    excute(): BTResult {
        let result = this.doExcuteFunc() ? BTResult.suc : BTResult.fail;
        return result;
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteFuncString + 
            " is " + this.getExcuteResStr();           
    }

    createExcuteFunc(node: cc.Node, funcStr: string) {
        cc.error("need inherit");
    }

    doExcuteFunc(): boolean {
        cc.error("need inherit");
        return false;
    }

    getExcuteResStr(): string {
        return "";
    }
}