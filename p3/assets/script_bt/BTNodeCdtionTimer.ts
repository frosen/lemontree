// BTNodeCdtionTimer.ts
// 计时器，只能作为until使用，因为需要注册父action的action begin事件
// lly 2018.4.5

const { ccclass, property } = cc._decorator;

import { BTNode, BTResult } from './BTNode';
import { BTNodeAction, ActionBeginKey } from './BTNodeAction';
import BTComp from './BTComp';

const CurTimeKey: string = 'CurTime';
const MaxTime: number = 999999;

@ccclass
export default class BTNodeCdtionTimer extends BTNode {
    typeString: string = 'AFTER';

    /** 持续的时间 （秒） */
    @property
    untilTime: number = 1;

    getBTName(): string {
        return this.untilTime.toString() + ' seconds ago';
    }

    init(comp: BTComp) {
        super.init(comp);

        comp.setValue(this.btIndex, CurTimeKey, MaxTime);

        this.registerBTUpdate(comp);
        this.registerBTActionBegin(comp);
    }

    registerBTUpdate(comp: BTComp) {
        comp.onUpdate(this.onBTUpdate.bind(this));
    }

    registerBTActionBegin(comp: BTComp) {
        let p: cc.Node = this.node.parent;
        let actNode: BTNodeAction = null;
        while (true) {
            if (!p || p instanceof cc.Scene) break;
            let mayActNode = p.getComponent(BTNodeAction);
            if (mayActNode) {
                actNode = mayActNode;
                break;
            }
            p = p.parent;
        }

        cc.assert(actNode, 'BTNodeCdtionTimer need BTNodeAction');

        comp.on(actNode.btIndex, ActionBeginKey, this.onTimerBegin.bind(this));
    }

    onBTUpdate(comp: BTComp, dt: number) {
        let t = comp.getValue(this.btIndex, CurTimeKey);
        comp.setValue(this.btIndex, CurTimeKey, t - dt);
    }

    onTimerBegin(comp: BTComp) {
        comp.setValue(this.btIndex, CurTimeKey, this.untilTime);
    }

    execute(comp: BTComp): BTResult {
        let t = comp.getValue(this.btIndex, CurTimeKey);
        if (t > 0) {
            return BTResult.fail;
        } else {
            let result = BTResult.suc;
            comp.setValue(this.btIndex, CurTimeKey, MaxTime); // 结束倒计时：通过一个很大的值避免再执行execute
            return result;
        }
    }
}
