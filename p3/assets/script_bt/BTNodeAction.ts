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
import {BTNodeWithFunc, ExcuteFuncKey} from "./BTNodeWithFunc";
import BTNodeActionUntil from "./BTNodeActionUntil";
import BTNodeActionEnd from "./BTNodeActionEnd";
import BTComp from "./BTComp";

export const RunningKey: string = "running";
export const GoActionKey: string = "goAction";

export const ActionBeginKey: string = "actionBegin";
export const ActionEndKey: string = "actionEnd";

@ccclass
export class BTNodeAction extends BTNodeWithFunc<() => void> {

    /** 类型名称，用于在层级管理器中显示 */
    typeString: string = "DO";

    /** 直到函数组，遍历其子until节点获得 */
    untilFuncs: ((comp: BTComp) => BTResult)[] = [];
    /** 结束函数组，遍历其子until节点获得 */
    endFuncs: ((comp: BTComp) => BTResult)[] = [];

    onLoad() {
        super.onLoad();

        if (!CC_EDITOR) {
            for (const child of this.node.children) {
                if (child.active == false) continue;
                if (child.getComponent(BTNodeActionUntil)) {
                    for (const untilChild of child.children) {
                        if (untilChild.active == false) continue;
                        let btNode = untilChild.getComponent(BTNode);
                        let func = btNode["excute"].bind(btNode);
                        this.untilFuncs.push(func);
                    }
                } else if (child.getComponent(BTNodeActionEnd)) {
                    for (const endChild of child.children) {
                        if (endChild.active == false) continue;
                        let btNode = endChild.getComponent(BTNode);
                        let func = btNode["excute"].bind(btNode);
                        this.endFuncs.push(func);
                    }
                } else {
                    cc.error("wrong child in action");
                }
            }

            let curComp = BTNode.getBTCtrlr().curComp;
            curComp.setValue(this.btIndex, RunningKey, false);
            curComp.setValue(this.btIndex, GoActionKey, false);
        }
    }

    getBTName(): string {
        return this.excuteString;
    }

    excute(comp: BTComp): BTResult {
        let result: BTResult
        if (!this.isRunning(comp)) {
            comp.setValue(this.btIndex, RunningKey, true);
            comp.setValue(this.btIndex, GoActionKey, true);
            result = BTResult.running;
        } else {
            if (this.checkRunningEnd(comp)) {
                this.endRunning(comp);
                result = BTResult.continue;
            } else {
                result = BTResult.running;
            }
        }
        return result;
    }

    doAction(comp: BTComp) {
        if (comp.getValue(this.btIndex, GoActionKey)) {
            comp.setValue(this.btIndex, GoActionKey, false);
            let func = comp.getValue(this.btIndex, ExcuteFuncKey);
            func();
            comp.emit(this.btIndex, ActionBeginKey);
        }
    }

    isRunning(comp: BTComp): boolean {
        return comp.getValue(this.btIndex, RunningKey);
    }

    endRunning(comp: BTComp) {
        comp.setValue(this.btIndex, RunningKey, false);
        for (const endFunc of this.endFuncs) {
            endFunc(comp);
        }
        comp.emit(this.btIndex, ActionEndKey);
    }

    checkRunningEnd(comp: BTComp): boolean {
        for (const untilFunc of this.untilFuncs) {
            if (untilFunc(comp) == BTResult.suc) return true;
        }
        return false;
    }
}