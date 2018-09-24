// BTNodeWithFunc.ts
// 带有回调的节点，需要继承
// lly 2018.4.5

const {ccclass, property} = cc._decorator;

import {BTNode} from "./BTNode";
import BTComp from "./BTComp";

export const ExcuteFuncKey: string = "excuteFunc";

@ccclass
export abstract class BTNodeWithFunc<FUNC_TYPE> extends BTNode {

    /** 执行函数名称 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property excuteString: string = "";

    init(comp: BTComp) {
        super.init(comp);
        let excuteFunc: FUNC_TYPE = this._getFuncFromString(comp.node, this.excuteString);
        comp.setValue(this.btIndex, ExcuteFuncKey, excuteFunc);
    }

    _getFuncFromString(node: cc.Node, str: string): any {
        let strings = str.split(":");
        let comp = node.getComponent(strings[0]);
        cc.assert(comp, "When get func: " + node.name + " wrong component: " + strings[0]);
        let func = comp[strings[1]];
        cc.assert(func && typeof(func) == "function", strings[0] + " wrong component function: " + strings[1]);
        return func.bind(comp);
    };
}