// BTNodeActSet.ts
// 行为树节点，设置节点，类似action，不过不进入running状态，而是瞬间动作
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import BTNodeWithFunc from "./BTNodeWithFunc";
import BTBase from "./BTBase";

@ccclass
export default class BTNodeActSet extends BTNodeWithFunc<() => void> {

    typeString: string = "SET";

    excute(): BTResult {
        this.doSet();
        return BTResult.continue;
    }

    doSet() {
        this.excuteFunc();
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteString;           
    }
}
