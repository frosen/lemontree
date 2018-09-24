// BTNodeSequence.ts
// 行为树节点，顺序节点
//
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeGroup from "./BTNodeGroup";
import BTComp from "./BTComp";

export const CurRunningNodeKey: string = "CurRunningNode";

@ccclass
export class BTNodeSequence extends BTNodeGroup {

    typeString: string = "Sequence";

    /** 运行时，是否检测运行节点之前其他节点 */
    @property
    checkingAheadInRunning: boolean = false;

    onLoad() {
        /** 当前运行的子节点 */
        let curComp = BTNode.getBTCtrlr().curComp;
        curComp.setValue(this.btIndex, CurRunningNodeKey, null);
    }

    getBTName(): string {
        return super.getBTName() + this.getCheckingAheadInRunningStr();
    }

    getCheckingAheadInRunningStr(): string {
        return this.checkingAheadInRunning ? " -- CheckAhead" : "";
    }

    excute(comp: BTComp): BTResult {
        if (!this.isRunning(comp)) {
            return this.excuteInNormal(comp);
        } else {
            return this.excuteInRunning(comp);
        }
    }

    isRunning(comp: BTComp): boolean {
        return comp.getValue(this.btIndex, CurRunningNodeKey) != null;
    }

    excuteInNormal(comp: BTComp, inputIndex: number = 0): BTResult {
        for (let index = inputIndex; index < this.btNodes.length; index++) {
            let btNode = this.btNodes[index];
            let result: BTResult = btNode.excute(comp);

            if (result == BTResult.fail) {
                return BTResult.fail; // 一旦有失败则直接返回而不往后执行

            } else if (result == BTResult.running) {
                comp.setValue(this.btIndex, CurRunningNodeKey, btNode);
                return BTResult.running; // 一旦进入运行状态，也不往后执行了
            }
        }

        return BTResult.suc;
    }

    excuteInRunning(comp: BTComp): BTResult {
        let curRunningBTNode = comp.getValue(this.btIndex, CurRunningNodeKey);

        if (this.checkingAheadInRunning) {
            for (const btNode of this.btNodes) {
                if (btNode == curRunningBTNode) break;

                let result: BTResult = btNode.excute(comp);

                if (result == BTResult.fail) {
                    this.endRunning(comp);
                    return BTResult.fail; // 一旦有失败则直接返回而不往后执行

                } else if (result == BTResult.running) {
                    this.endRunning(comp);
                    comp.setValue(this.btIndex, CurRunningNodeKey, btNode);
                    return BTResult.running; // 一旦进入运行状态，也不往后执行了
                }
            }
        }


        let result = curRunningBTNode.excute(comp);
        if (result == BTResult.running) {
            return BTResult.running;

        } else if (result == BTResult.fail) {
            comp.setValue(this.btIndex, CurRunningNodeKey, null);
            return BTResult.fail;

        } else {
            let nextIndex = this.btNodes.indexOf(curRunningBTNode) + 1;
            comp.setValue(this.btIndex, CurRunningNodeKey, null);
            return this.excuteInNormal(comp, nextIndex);
        }
    }

    doAction(comp: BTComp) {
        let curRunningBTNode = comp.getValue(this.btIndex, CurRunningNodeKey);
        curRunningBTNode.doAction(comp);
    }

    endRunning(comp: BTComp) {
        let curRunningBTNode = comp.getValue(this.btIndex, CurRunningNodeKey);
        curRunningBTNode.endRunning(comp);
        comp.setValue(this.btIndex, CurRunningNodeKey, null);
    }
}
