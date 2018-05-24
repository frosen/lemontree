// BTNodeCdtion.ts
// 行为树节点，条件节点的基类，需要继承
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import BTNodeWithFunc from "./BTNodeWithFunc";
import BTBase from "./BTBase";

@ccclass
export default abstract class BTNodeCdtion<FUNC_TYPE> extends BTNodeWithFunc<FUNC_TYPE> {

    typeString: string = "IF";

    excute(): BTResult {
        let result = this.doExcuteFunc() ? BTResult.suc : BTResult.fail;
        return result;
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteString + 
            " is " + this.getExcuteResStr();           
    }

    abstract doExcuteFunc(): boolean;

    getExcuteResStr(): string {
        return "";
    }
}