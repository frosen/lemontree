// BTNodeCondition.ts
// 行为树节点，条件节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTBase from "./BTBase";

@ccclass
export default class BTNodeCondition extends BTNode {

    typeString: string = "IF";

    /** 执行节点 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property(cc.Node) excuteNode: cc.Node = null;
    /** 执行函数名称 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property excuteFuncString: string = "";
    /** 当前行为执行函数 */
    excuteFunc: () => boolean = null;

    /** excuteFunc的返回结果为什么值表示成功 */
    @property
    checkingTrue: boolean = true;

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
            this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteFuncString);
        }
    }

    excute(): BTResult {
        let result: boolean = this.excuteFunc();
        return result == this.checkingTrue ? BTResult.suc : BTResult.fail;
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteFuncString + 
            " is " + (this.checkingTrue ? "True" : "False");           
    }
}