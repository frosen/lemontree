// BTCtrlr.ts
// 行为树根控制器，
//
// lly 2018.9.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTComp from "./BTComp";

@ccclass
export default class BTCtrlr extends cc.Component {

    // 行为树字典，每种行为树记录一份
    btDict: {[key: string]: BTNode} = {};

    /** 当前组件，用于初始化 */
    curComp: BTComp = null;

    setBT(comp: BTComp, name: string, btPrefab: cc.Prefab) {
        if (this.btDict[name]) return;

        this.curComp = comp;

        let btRootNode = cc.instantiate(btPrefab);
        this.node.addChild(btRootNode);
        btRootNode.active = false;

        this.btDict[name] = btRootNode.getComponent(BTNode);

        this.curComp = null;
    }

    updateBT(comp: BTComp, name: string) {
        let btNode = this.btDict[name];
        let result = btNode.excute(comp);
        if (result == BTResult.running) btNode.doAction(comp);
    }
}