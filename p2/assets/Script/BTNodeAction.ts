// BTNodeAction.ts
// 行为树节点，动作节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";

@ccclass
export default class BTNodeAction extends BTNode {

    typeString: string = "Action";

    @property(cc.Node)
    excuteNode: cc.Node = null;

    @property
    excuteFuncString: string = "";

    excuteFunc: () => void = null;

    onLoad() {
        if (!CC_EDITOR) {
            this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteFuncString);
        }
    }

    excute(): BTResult {
        this.excuteFunc();
        return BTResult.suc;
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "?") + " >> " + this.excuteFuncString;
    }
}