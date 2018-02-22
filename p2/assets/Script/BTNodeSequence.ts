// BTNodeSequence.ts
// 行为树节点，顺序节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeGroup from "./BTNodeGroup";
import BTNodeAction from "./BTNodeAction";

@ccclass
export default class BTNodeSequence extends BTNodeGroup {

    typeString: string = "Sequence";

    /** 运行时，是否检测运行节点之前其他节点 */
    @property
    checkingAheadInRunning: boolean = false;

    /** 当前运行的子节点 */
    curRunningBTNode: BTNodeAction = null;

    excute(): BTResult {
        if (!this.isRunning()) {
            return this.excuteInNormal();
        } else {
            return this.excuteInRunning();
        }
    }

    excuteInNormal(inputIndex: number = 0): BTResult {
        for (let index = inputIndex; index < this.btNodes.length; index++) {          
            let btNode = this.btNodes[index];
            let result: BTResult = btNode.excute();

            if (result == BTResult.fail) {
                return BTResult.fail; // 一旦有失败则直接返回而不往后执行

            } else if (result == BTResult.running) {
                this.curRunningBTNode = btNode as BTNodeAction;
                return BTResult.running; // 一旦进入运行状态，也不往后执行了
            }
        }

        return BTResult.suc;
    }

    excuteInRunning(): BTResult {
        if (this.checkingAheadInRunning) {
            for (const btNode of this.btNodes) {
                if (btNode == this.curRunningBTNode) break;
    
                let result: BTResult = btNode.excute();
    
                if (result == BTResult.fail) {
                    this.endRunning();
                    return BTResult.fail; // 一旦有失败则直接返回而不往后执行
    
                } else if (result == BTResult.running) {
                    this.endRunning();
                    this.curRunningBTNode = btNode as BTNodeAction;
                    return BTResult.running; // 一旦进入运行状态，也不往后执行了
                }
            }
        }

        if (this.curRunningBTNode.excute() != BTResult.running) {
            let nextIndex = this.btNodes.indexOf(this.curRunningBTNode) + 1;
            this.endRunning();
            return this.excuteInNormal(nextIndex);
        }

        return BTResult.running;
    }

    doAction() {
        this.curRunningBTNode.doAction();
    }

    isRunning(): boolean {
        return this.curRunningBTNode != null;
    }

    endRunning() {
        this.curRunningBTNode.endRunning();
        this.curRunningBTNode = null;            
    }
}
