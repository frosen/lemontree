// BTNodeCdtionBool.ts
// 行为树节点，条件节点，判断函数结果是否为true，false
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import BTNodeCdtion from "./BTNodeCdtion";
import {BTResult} from "./BTNode";

@ccclass
export default class BTNodeCdtionBool extends BTNodeCdtion<() => boolean> {

    /** excuteFunc的返回结果为什么值表示成功 */
    @property
    checkingTrue: boolean = true;

    doExcuteFunc(): boolean {
        return this.excuteFunc() == this.checkingTrue;
    }

    getExcuteResStr(): string {
        return this.checkingTrue ? "True" : "False";
    }
}