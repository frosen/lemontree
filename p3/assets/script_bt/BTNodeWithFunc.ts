// BTNodeWithFunc.ts
// 带有回调的节点，需要继承
// lly 2018.4.5

const {ccclass, property} = cc._decorator;

import {BTNode} from "./BTNode";
import BTComp from "./BTComp";
import BTNodeGroup from "./BTNodeGroup";

export const ExecuteFuncKey: string = "executeFunc";

@ccclass
export abstract class BTNodeWithFunc<FUNC_TYPE> extends BTNode {

    /** 执行函数名称 用于在编辑器中设置executeFunc，func可以有返回值 */
    @property executeString: string = "";

    update(dt: number) {
        if (!CC_EDITOR) return;
        this._checkExecuteString();
        super.update(dt);
    }

    _checkExecuteString() {
        // 去空格
        this.executeString = this.executeString.replace(/\s*/g,"");

        // 补上":"
        if (this.executeString.indexOf(":") < 0)
            this.executeString = ":" + this.executeString;

        // 检测comp名
        let p: cc.Node = this.node;
        while (true) {
            let _p = p.parent;
            if (!_p || _p instanceof cc.Scene || !_p.getComponent(BTNode)) {
                break;
            } else {
                p = _p;
            }
        }

        let groupNode: BTNodeGroup = p.getComponent(BTNodeGroup);
        if (!groupNode) return;

        let desc = groupNode.desc;
        let index = desc.indexOf("==>");
        if (index < 0) return;

        let data = this.executeString.split(":");
        this.executeString = desc.substr(index + 4) + ":" + data[1];
    }

    init(comp: BTComp) {
        super.init(comp);
        let executeFunc: FUNC_TYPE = this._getFuncFromString(comp.node, this.executeString);
        comp.setValue(this.btIndex, ExecuteFuncKey, executeFunc);
    }

    _getFuncFromString(node: cc.Node, str: string): any {
        let strings = str.split(":");
        let comp = node.getComponent(strings[0]);
        cc.assert(comp, "When get func: " + node.name + " wrong component: " + strings[0] + " at " + this.name);
        let func = comp[strings[1]];
        cc.assert(func && typeof(func) == "function", strings[0] + " wrong comp func: " + strings[1] + " at " + this.name);
        return func.bind(comp);
    };
}