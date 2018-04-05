// BTNodeWithFunc.ts
// 带有回调的节点，需要继承
// lly 2018.4.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeActionUntil from "./BTNodeActionUntil";
import BTNodeActionEnd from "./BTNodeActionEnd";
import BTBase from "./BTBase";

@ccclass
export default class BTNodeWithFunc<FUNC_TYPE> extends BTNode {

    /** 执行节点 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property(cc.Node) excuteNode: cc.Node = null;
    /** 执行函数名称 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property excuteString: string = "";
    /** 当前行为执行函数，若函数返回true，则表示需要进入running状态 */
    excuteFunc: FUNC_TYPE = null;

    onLoad() {
        if (!CC_EDITOR) {           
            this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteString);
        }
    }

    update(dt: number) {
        if (!CC_EDITOR) return;
        super.update(dt);
        this.autoGetExcuteNode();
        this.autoGetFunc();               
    }

    // 如果未指定节点，则自动获取
    autoGetExcuteNode() {
        if (!this.excuteNode) {
            let p: cc.Node = this.node.parent;
            while (true) {
                if (p.getComponent(BTBase)) {
                    this.excuteNode = p.parent;
                    break;
                }
                p = p.parent;
            }
        }
    }
    
    // 检测函数是否存在，如果不存在，重新调整，找不到则报错
    autoGetFunc() {
        if (!this.excuteNode) return;

        // 补上":"
        if (this.excuteString.indexOf(":") < 0)
            this.excuteString = ":" + this.excuteString;

        // 检测函数正确性
        let data = this.excuteString.split(":");
        do {  
            if (!data[0] || data[0].length < 1) break;
            
            let comp = this.excuteNode.getComponent(data[0]);
            if (!comp) break;

            let func = comp[data[1]];
            if (!func) break;

            if (comp.name != data[0]) {
                let compName = (comp.name.split("<"))[1].slice(0, -1);
                let newStr = compName + ":" + data[1];
                this.excuteString = newStr;
            }

            return;
        } while (false);

        // 替换函数
        let comps = this.excuteNode.getComponents(cc.Component);
        for (const comp of comps) {
            let func = comp[data[1]];
            if (func && typeof(func) == "function") {
                let compName = (comp.name.split("<"))[1].slice(0, -1);
                let newStr = compName + ":" + data[1];
                cc.log("change from: " + this.excuteString + " to: " + newStr);
                this.excuteString = newStr;
                return;
            }
        }

        // 没有正确的函数存在
        cc.error(this.node.name + " wrong excuteFuncString! at " + (this.node.parent ? this.node.parent.name : "root"));
    }
}