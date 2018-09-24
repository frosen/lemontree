// BTNodeActSet.ts
// 行为树节点，设置节点，类似action，不过不进入running状态，而是瞬间动作
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import {BTNodeWithFunc, ExcuteFuncKey} from "./BTNodeWithFunc";
import BTComp from "./BTComp";

@ccclass
export default class BTNodeActSet extends BTNodeWithFunc<() => void> {

    typeString: string = "SET";

    getBTName(): string {
        return this.excuteString;           
    }

    excute(comp: BTComp): BTResult {
        this.doSet(comp);
        return BTResult.continue;
    }

    doSet(comp: BTComp) {
        let func = comp.getValue(this.btIndex, ExcuteFuncKey);
        func();
    }
}
