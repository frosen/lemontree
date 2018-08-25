// BTNodeParallel.ts
// 行为树节点，平行节点
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

import {BTResult} from "./BTNode";
import BTNodeGroup from "./BTNodeGroup";

@ccclass
export default class BTNodeParallel extends BTNodeGroup {

    typeString: string = "Parallel";

    excute(): BTResult {
        for (const btNode of this.btNodes) {
            let result = btNode.excute();
            if (result == BTResult.running) btNode.doAction();
        }

        return BTResult.suc;
    }
}
