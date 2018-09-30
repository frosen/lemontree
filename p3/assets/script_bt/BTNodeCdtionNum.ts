// BTNodeCdtionNum.ts
// 行为树节点，条件节点，判断函数结果数字
//
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import BTNodeCdtion from "./BTNodeCdtion";
import {ExecuteFuncKey} from "./BTNodeWithFunc";
import BTComp from "./BTComp";

/** 比较类型 */
const CompareType = cc.Enum({
    equal: 0,
    notEqual: 1,

    moreThan: 2,
    lessThan: 3,

    notMoreThan: 4,
    notLessThan: 5,
})

@ccclass
export default class BTNodeCdtionNum extends BTNodeCdtion<() => number> {

    /** 比较类型 */
    @property({
        type: CompareType
    })
    compareType = CompareType.equal;

    /** executeFunc的返回结果比较的数字 */
    @property
    compareNum: number = 0;

    getExecuteResStr(): string {
        let str = "";
        switch (this.compareType) {
            case CompareType.equal:       str += "== "; break;
            case CompareType.notEqual:    str += "!= "; break;
            case CompareType.moreThan:    str += "> "; break;
            case CompareType.lessThan:    str += "< "; break;
            case CompareType.notMoreThan: str += "<= "; break;
            case CompareType.notLessThan: str += ">= "; break;
        }
        return str + this.compareNum.toString();
    }

    doExecuteFunc(comp: BTComp): boolean {
        let func = comp.getValue(this.btIndex, ExecuteFuncKey);
        let result: number = func();
        switch (this.compareType) {
            case CompareType.equal:       return result == this.compareNum;
            case CompareType.notEqual:    return result != this.compareNum;
            case CompareType.moreThan:    return result > this.compareNum;
            case CompareType.lessThan:    return result < this.compareNum;
            case CompareType.notMoreThan: return result <= this.compareNum;
            case CompareType.notLessThan: return result >= this.compareNum;
        }
    }
}