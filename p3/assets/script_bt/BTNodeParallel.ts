// BTNodeParallel.ts
// 行为树节点，平行节点
//
// lly 2018.2.5

const { ccclass, property } = cc._decorator;

import { BTResult } from './BTNode';
import BTNodeGroup from './BTNodeGroup';
import BTComp from './BTComp';

@ccclass
export default class BTNodeParallel extends BTNodeGroup {
    typeString: string = 'Parallel';

    execute(comp: BTComp): BTResult {
        for (const btNode of this.btNodes) {
            let result = btNode.execute(comp);
            if (result == BTResult.running) btNode.doAction(comp);
        }

        return BTResult.suc;
    }
}
