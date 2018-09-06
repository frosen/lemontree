// BTNodeCdtionTimer.ts
// 计时器，只能作为until使用，因为需要注册父action的action begin事件
// lly 2018.4.5

const {ccclass, property} = cc._decorator;

import {BTNode, BTResult} from "./BTNode";
import BTBase from "./BTBase";
import BTNodeAction from "./BTNodeAction";

@ccclass
export default class BTNodeCdtionTimer extends BTNode {

    typeString: string = "AFTER";

    /** 持续的时间 （秒） */
    @property
    untilTime: number = 1;

    /** 当前时间 */
    curTime: number = 999999;

    onLoad() {
        this.registerBTUpdate();
        this.registerBTActionBegin();        
    }

    registerBTUpdate() {
        let p: cc.Node = this.node.parent;
        let baseNode: cc.Node = null;
        while (true) {
            if (p.getComponent(BTBase)) {
                baseNode = p;
                break;
            }
            p = p.parent;
        }

        cc.assert(baseNode, "BTNodeCdtionTimer need in bt tree");
        baseNode.on("BTUpdate", this.onBTUpdate.bind(this));
    }

    registerBTActionBegin() {
        let p: cc.Node = this.node.parent;
        let actNode: cc.Node = null;
        while (true) {
            if (p.getComponent(BTNodeAction)) {
                actNode = p;
                break;
            }
            p = p.parent;
        }

        cc.assert(actNode, "BTNodeCdtionTimer need in until");
        actNode.on("BTActionBegin", this.onTimerBegin.bind(this));
    }

    onBTUpdate(event) {
        let dt: number = event.detail.dt;
        this.curTime -= dt;
    }

    onTimerBegin() {
        this.curTime = this.untilTime;
    }

    excute(): BTResult {
        if (this.curTime > 0) {
            return BTResult.fail;
        } else {
            let result = BTResult.suc;
            this.curTime = 999999; // 结束倒计时：通过一个很大的值避免再执行excute
            return result;
        }
    }

    getBTName(): string {
        return this.untilTime.toString() + " seconds ago";           
    }
}