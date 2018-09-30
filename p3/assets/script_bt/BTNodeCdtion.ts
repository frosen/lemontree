// BTNodeCdtion.ts
// 行为树节点，条件节点的基类，需要继承
//
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import {BTNodeWithFunc} from "./BTNodeWithFunc";
import BTComp from "./BTComp";

@ccclass
export default abstract class BTNodeCdtion<FUNC_TYPE> extends BTNodeWithFunc<FUNC_TYPE> {

    typeString: string = "IF";

    getBTName(): string {
        return this.executeString + " is " + this.getExecuteResStr();
    }

    abstract getExecuteResStr(): string;

    execute(comp: BTComp): BTResult {
        let result = this.doExecuteFunc(comp) ? BTResult.suc : BTResult.fail;
        return result;
    }

    abstract doExecuteFunc(comp: BTComp): boolean;
}