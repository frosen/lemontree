// BTNode.ts
// 行为树节点基类，各种行为树节点行为继承于此类
//
// lly 2018.2.5

const {ccclass, property, executeInEditMode, disallowMultiple} = cc._decorator;

import MyComponent from "../script/MyComponent";
import BTComp from "./BTComp";
import BTCtrlr from "./BTCtrlr";

/** 行为返回的结果 */
export enum BTResult {
    /** 成功 */
    suc,
    /** 失败 */
    fail,
    /** 正在执行，用于action节点 */
    running,
    /** 无效果，用于set节点 */
    continue,
}

@ccclass
@executeInEditMode
@disallowMultiple
export abstract class BTNode extends MyComponent {

    /** 行为树节点唯一索引值生成数 */
    static btIndexCount: number = 0;
    /** 行为树节点唯一索引值 */
    btIndex: string = "";

    onLoad() {
        BTNode.btIndexCount++;
        this.btIndex = BTNode.btIndexCount.toString();
    }

    /** 类型名称，用于在层级管理器中显示 */
    typeString: string = "";

    update(_: number) {
        if (!CC_EDITOR) return;
        this.node.name = this.typeString + ": " + this.getBTName();
    }

    abstract getBTName(): string;

    /**
     * 执行并获取每个节点的执行结果
     * @return BTResult
     */
    abstract excute(comp: BTComp): BTResult;

    /**
     * 执行每个节点的行动（只有running时有行动）
     */
    doAction(comp: BTComp) {

    }

    isRunning(comp: BTComp): boolean {
        return false;
    }

    endRunning(comp: BTComp) {

    }

    static getBTCtrlr(): BTCtrlr {
        return cc.find("bt").getComponent(BTCtrlr);
    }
}
