// BTComp.ts
// 行为树组件
//
// lly 2018.9.5

const {ccclass, property, executionOrder} = cc._decorator;

import MyComponent from "../script/MyComponent";
import BTCtrlr from "./BTCtrlr";

const UpdateKey: string = "Update";

@ccclass
@executionOrder(EXECUTION_ORDER.BehaviorTree)
export default class BTComp extends MyComponent {

    @property(cc.Prefab)
    btPrefab: cc.Prefab = null;

    /** 行为树管理器 */
    ctrlr: BTCtrlr = null;

    /** 行为树名称 */
    name: string = null;

    /** 记录所有对应的行为树中的值 */
    valueDict: {[key: string]: any;} = {};

    callDict: {[key: string]: any[];} = {};

    onLoad() {
        this.ctrlr = cc.find("bt").getComponent(BTCtrlr);
        let name = this.btPrefab.name;
        this.ctrlr.setBT(this, name, this.btPrefab);
        this.name = name;
    }

    update(dt: number) {
        this._emitUpdate(dt);
        this.ctrlr.updateBT(this, this.name);
    }

    // 记录和使用行为树节点中生成的值 ========================================================

    setValue(btIndex: string, key: string, value: any) {
        this.valueDict[btIndex + key] = value;
    }

    getValue(btIndex: string, key: string): any {
        return this.valueDict[btIndex + key];
    }

    // 记录和使用行为树发出的事件 ========================================================

    on(btIndex: string, key: string, call: () => void) {
        let callkey = btIndex + key;
        if (!this.callDict[callkey]) {
            this.callDict[callkey] = [];
        }
        this.callDict[callkey].push(call);
    }

    onUpdate(call: (dt: number) => void) {
        if (!this.callDict[UpdateKey]) {
            this.callDict[UpdateKey] = [];
        }
        this.callDict[UpdateKey].push(call);
    }

    emit(btIndex: string, key: string) {
        let callkey = btIndex + key;
        let calls = this.callDict[callkey];
        if (calls) {
            for (const call of calls) {
                call(this);
            }
        }
    }

    _emitUpdate(dt: number) {
        let calls = this.callDict[UpdateKey];
        if (calls) {
            for (const call of calls) {
                call(this, dt);
            }
        }
    }
}
