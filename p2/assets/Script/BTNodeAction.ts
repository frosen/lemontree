// BTNodeAction.ts
// 行为树节点，动作节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeCondition from "./BTNodeCondition";
import BTNodeActionUntil from "./BTNodeActionUntil";
import BTNodeActionEnd from "./BTNodeActionEnd";

@ccclass
export default class BTNodeAction extends BTNode {

    typeString: string = "DO";

    @property(cc.Node) excuteNode: cc.Node = null;
    @property excuteFuncString: string = "";
    excuteFunc: () => boolean = null;

    untilFuncs: (() => BTResult)[] = [];
    endFuncs: (() => BTResult)[] = [];

    running: boolean = false;

    onLoad() {
        if (!CC_EDITOR) {
            this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteFuncString);
        }
    }

    start() {
        for (const child of this.node.children) {
            if (child.getComponent(BTNodeActionUntil)) {
                for (const untilChild of child.children) {
                    let comp = untilChild.getComponent(BTNodeCondition);
                    let func = comp["excute"].bind(comp);
                    this.untilFuncs.push(func);
                }
            } else if (child.getComponent(BTNodeActionEnd)) {
                for (const endChild of child.children) {
                    let comp = endChild.getComponent(BTNodeAction);
                    let func = comp["excute"].bind(comp);
                    this.endFuncs.push(func);
                }
            } else {
                cc.error("wrong child in action");
            }
        }
    }

    excute(): BTResult {
        this.running = this.excuteFunc();
        return this.running ? BTResult.running : BTResult.noRunning;
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "?") + " >> " + this.excuteFuncString;
    }

    checkRunningEnd(): boolean {
        for (const untilFunc of this.untilFuncs) {
            if (untilFunc() == BTResult.suc) return true;
        }
        return false;
    }

    isRunning(): boolean {
        return this.running;
    }

    endRunning() {
        this.running = false;
        for (const endFunc of this.endFuncs) {
            endFunc();
        }     
    }
    
}