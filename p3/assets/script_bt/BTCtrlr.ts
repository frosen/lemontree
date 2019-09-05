// BTCtrlr.ts
// 行为树根控制器，
//
// lly 2018.9.5

const { ccclass, property } = cc._decorator;

import { BTNode, BTResult } from './BTNode';
import BTComp from './BTComp';

@ccclass
export default class BTCtrlr extends cc.Component {
    // 行为树字典，每种行为树记录一份
    btDict: { [key: string]: BTNode } = {};

    setBT(comp: BTComp, name: string, btPrefab: cc.Prefab) {
        let topBtNode = this.btDict[name];
        if (!topBtNode) {
            let btRootNode = cc.instantiate(btPrefab);
            cc.game.addPersistRootNode(btRootNode);
            let btNode = btRootNode.getComponent(BTNode);
            this.btDict[name] = btNode;
            topBtNode = btNode;
        }

        topBtNode.init(comp);
    }

    updateBT(comp: BTComp, name: string) {
        let btNode = this.btDict[name];
        let result = btNode.execute(comp);
        if (result == BTResult.running) btNode.doAction(comp);
    }
}
