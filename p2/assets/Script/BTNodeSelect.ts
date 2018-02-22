// BTNodeSelect.ts
// 行为树节点，选择节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import BTNodeSequence from "./BTNodeSequence";
import BTNodeAction from "./BTNodeAction";

@ccclass
export default class BTNodeSelect extends BTNodeSequence {

    typeString: string = "Select";

    /** 运行时，是否检测运行节点之前其他节点，和sequence不一样的是，select默认为true */
    checkingAheadInRunning: boolean = true;

    excuteInNormal(inputIndex: number = 0): BTResult {
        for (let index = inputIndex; index < this.btNodes.length; index++) {          
            let btNode = this.btNodes[index];
            let result: BTResult = btNode.excute();

            if (result == BTResult.suc) {
                return BTResult.suc; // 一旦成功则直接返回而不往后执行

            } else if (result == BTResult.running) {
                this.curRunningBTNode = btNode;
                return BTResult.running; // 一旦进入运行状态，也不往后执行了
            }
        }

        return BTResult.fail;
    }

    excuteInRunning(): BTResult {
        if (this.checkingAheadInRunning) {
            for (const btNode of this.btNodes) {
                if (btNode == this.curRunningBTNode) break;

                let result: BTResult = btNode.excute();
    
                if (result == BTResult.suc) {
                    this.endRunning();
                    return BTResult.suc; // 一旦成功则直接返回而不往后执行
    
                } else if (result == BTResult.running) {
                    this.endRunning();
                    this.curRunningBTNode = btNode;
                    return BTResult.running; // 一旦进入运行状态，也不往后执行了
                }
            }
        }

        if (this.curRunningBTNode.excute() != BTResult.running) {
            let nextIndex = this.btNodes.indexOf(this.curRunningBTNode) + 1;
            this.curRunningBTNode = null;
            return this.excuteInNormal(nextIndex);
        }

        return BTResult.running;
    }
}
