// BTNodeCondition.ts
// 行为树节点，条件节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";

@ccclass
export default class BTNodeCondition extends BTNode {

    typeString: string = "Condition";

    @property(cc.Node)
    excuteNode: cc.Node = null;

    @property
    excuteFuncString: string = "";
    excuteFunc: () => boolean = null;

    @property
    checkingTrue: boolean = true;

    onLoad() {
        if (!CC_EDITOR) {
            this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteFuncString);
        }
    }

    excute(): BTResult {
        let result: boolean = this.excuteFunc();
        return result == this.checkingTrue ? BTResult.suc : BTResult.fail;
    }

    getBTName(): string {
        return "if " + (this.excuteNode ? this.excuteNode.name : "?") + " >> " + this.excuteFuncString + 
            " is " + (this.checkingTrue ? "True" : "False");
            
    }
}