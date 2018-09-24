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
        return this.excuteString + " is " + this.getExcuteResStr();           
    }

    abstract getExcuteResStr(): string;

    excute(comp: BTComp): BTResult {
        let result = this.doExcuteFunc(comp) ? BTResult.suc : BTResult.fail;
        return result;
    }

    abstract doExcuteFunc(comp: BTComp): boolean;
}