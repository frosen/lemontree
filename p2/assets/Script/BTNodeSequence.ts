// BTNodeSequence.ts
// 行为树节点，顺序节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";

@ccclass
export default class BTNodeSequence extends BTNode {

    typeString: string = "Sequence";

    btNodes: BTNode[] = [];

    @property
    desc: string = "";

    @property
    checkingAheadInRunning: boolean = false;

    curRunningIndex: number = -1;

    start() {
        for (const child of this.node.children) {
            let comp = child.getComponent(BTNode);
            this.btNodes.push(comp);
        }
    }

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
                this.curRunningIndex = index;
                return BTResult.running; // 一旦进入运行状态，也不往后执行了
            }
        }

        return BTResult.suc;
    }

    excuteInRunning(): BTResult {
        if (this.checkingAheadInRunning) {
            for (let index = 0; index < this.curRunningIndex; index++) {          
                let btNode = this.btNodes[index];
                let result: BTResult = btNode.excute();
    
                if (result == BTResult.fail) {
                    this.endRunning();
                    return BTResult.fail; // 一旦有失败则直接返回而不往后执行
    
                } else if (result == BTResult.running) {
                    this.endRunning();
                    this.curRunningIndex = index;
                    return BTResult.running; // 一旦进入运行状态，也不往后执行了
                }
            }
        }

        if (this.checkRunningEnd()) {
            let nextIndex = this.curRunningIndex + 1;
            this.endRunning();

            return this.excuteInNormal(nextIndex);
        }
        return BTResult.running;
    }

    getBTName(): string {
        return this.desc;
    }

    checkRunningEnd(): boolean {
        return this.btNodes[this.curRunningIndex].checkRunningEnd();
    }

    isRunning(): boolean {
        return this.curRunningIndex != -1;
    }

    endRunning() {
        this.btNodes[this.curRunningIndex].endRunning();
        this.curRunningIndex = -1;            
    }
}
