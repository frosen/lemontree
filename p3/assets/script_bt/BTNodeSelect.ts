// BTNodeSelect.ts
// 行为树节点，选择节点
//
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import {BTNodeSequence, CurRunningNodeKey} from "./BTNodeSequence";
import BTComp from "./BTComp";

@ccclass
export default class BTNodeSelect extends BTNodeSequence {

    typeString: string = "Select";

    /** 运行时，是否检测运行节点之前其他节点，和sequence不一样的是，select默认为true */
    checkingAheadInRunning: boolean = true;

    getCheckingAheadInRunningStr(): string {
        return this.checkingAheadInRunning ? "" : " -- No!CheckAhead";
    }

    excuteInNormal(comp: BTComp, inputIndex: number = 0): BTResult {
        let finalresult: BTResult = BTResult.fail;
        for (let index = inputIndex; index < this.btNodes.length; index++) {
            let btNode = this.btNodes[index];
            let result: BTResult = btNode.excute(comp);

            if (result == BTResult.suc) {
                finalresult = BTResult.suc; // 一旦成功则直接返回而不往后执行
                break;

            } else if (result == BTResult.running) {
                comp.setValue(this.btIndex, CurRunningNodeKey, btNode);
                finalresult = BTResult.running; // 一旦进入运行状态，也不往后执行了
                break;
            }
        }
        return finalresult;
    }

    excuteInRunning(comp: BTComp): BTResult {
        let curRunningBTNode = comp.getValue(this.btIndex, CurRunningNodeKey);

        if (this.checkingAheadInRunning) {
            for (const btNode of this.btNodes) {
                if (btNode == curRunningBTNode) break;

                let result: BTResult = btNode.excute(comp);

                if (result == BTResult.suc) {
                    this.endRunning(comp);
                    return BTResult.suc; // 一旦成功则直接返回而不往后执行

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

        } else if (result == BTResult.suc) {
            comp.setValue(this.btIndex, CurRunningNodeKey, null);
            return BTResult.suc;

        } else {
            let nextIndex = this.btNodes.indexOf(curRunningBTNode) + 1;
            comp.setValue(this.btIndex, CurRunningNodeKey, null);
            return this.excuteInNormal(comp, nextIndex);
        }
    }
}
