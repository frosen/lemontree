// BTNodeAction.ts
// 行为树节点，动作节点
// 与通常的action不同，这里的action不会返回成功或者失败，而只是返回是否running
// 其成功失败，需要在后面增加condition来判别
// running状态下行为树不会继续往下进行，从下一帧开始从头遍历节点，如果有优先级更高的任务则会结束此处的running
// 直到当前行动时，会遍历当前action下的until，返回true则表示running结束
// running结束时，会执行节点下的end，之后会在当前帧继续执行下一个节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeActionUntil from "./BTNodeActionUntil";
import BTNodeActionEnd from "./BTNodeActionEnd";
import BTBase from "./BTBase";

@ccclass
export default class BTNodeAction extends BTNode {

    /** 类型名称，用于在层级管理器中显示 */
    typeString: string = "DO";

    /** 执行节点 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property(cc.Node) excuteNode: cc.Node = null;
    /** 执行函数名称 用于在编辑器中设置excuteFunc，func可以有返回值 */
    @property excuteFuncString: string = "";
    /** 当前行为执行函数，若函数返回true，则表示需要进入running状态 */
    excuteFunc: () => boolean = null;

    /** 直到函数组，遍历其子until节点获得 */
    untilFuncs: (() => BTResult)[] = [];
    /** 结束函数组，遍历其子until节点获得 */
    endFuncs: (() => BTResult)[] = [];

    /** 是否处于running状态 */
    running: boolean = false;

    onLoad() {
        if (!CC_EDITOR) {
            if (!this.excuteNode) {
                let p: cc.Node = this.node.parent;
                while (true) {
                    if (p.getComponent(BTBase)) break;
                    p = p.parent;
                }
                this.excuteNode = p.parent;
            }
            this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteFuncString);
        }
    }

    start() {
        for (const child of this.node.children) {
            if (child.getComponent(BTNodeActionUntil)) {
                for (const untilChild of child.children) {
                    let comp = untilChild.getComponent(BTNode);
                    let func = comp["excute"].bind(comp);
                    this.untilFuncs.push(func);
                }
            } else if (child.getComponent(BTNodeActionEnd)) {
                for (const endChild of child.children) {
                    let comp = endChild.getComponent(BTNode);
                    let func = comp["excute"].bind(comp);
                    this.endFuncs.push(func);
                }
            } else {
                cc.error("wrong child in action");
            }
        }
    }

    /** 执行action */
    goingToAction = false;

    excute(): BTResult {
        if (!this.running) {
            this.running = true;
            this.goingToAction = true;
            return BTResult.running;
        } else {
            return this.checkRunningEnd() == false ? BTResult.running : BTResult.continue;
        }
    }

    doAction() {
        if (this.goingToAction) {
            this.goingToAction = false;
            if (!this.checkRunningEnd()) {
                this.excuteFunc();
            }          
        }
    }

    getBTName(): string {
        return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteFuncString;
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

    checkRunningEnd(): boolean {
        for (const untilFunc of this.untilFuncs) {
            if (untilFunc() == BTResult.suc) return true;
        }
        return false;
    }
    
}