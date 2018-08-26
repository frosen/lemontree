// BTNodeSequence.ts
// 行为树节点，顺序节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTNodeGroup from "./BTNodeGroup";

@ccclass
export default class BTNodeSequence extends BTNodeGroup {

    typeString: string = "Sequence";

    /** 运行时，是否检测运行节点之前其他节点 */
    @property
    checkingAheadInRunning: boolean = false;

    /** 当前运行的子节点 */
    curRunningBTNode: BTNode = null;

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
                this.curRunningBTNode = btNode;
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
                    this.curRunningBTNode = btNode;
                    return BTResult.running; // 一旦进入运行状态，也不往后执行了
                }
            }
        }

        let result = this.curRunningBTNode.excute();
        if (result == BTResult.running) return BTResult.running;

        this.curRunningBTNode = null;

        if (result == BTResult.fail) return BTResult.fail;

        let nextIndex = this.btNodes.indexOf(this.curRunningBTNode) + 1;
        return this.excuteInNormal(nextIndex);
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

    getBTName(): string {
        return super.getBTName() + this.getCheckingAheadInRunningStr();
    }

    getCheckingAheadInRunningStr(): string {
        return this.checkingAheadInRunning ? " --- CA" : "";
    }
}
