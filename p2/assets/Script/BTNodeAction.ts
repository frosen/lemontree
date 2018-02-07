// BTNodeAction.ts
// 行为树节点基类，各种行为树节点行为继承于此类
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import BTNode from "./BTNode";

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

    excute() {
        
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "?") + " >> " + this.excuteFuncString;
    }
}