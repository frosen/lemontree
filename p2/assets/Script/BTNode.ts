// BTNode.ts
// 行为树节点基类，各种行为树节点行为继承于此类
// 
// lly 2018.2.5

const {ccclass, property, executeInEditMode, disallowMultiple} = cc._decorator;

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
export class BTNode extends cc.Component {

    /** 类型名称，用于在层级管理器中显示 */
    typeString: string = "";

    /**
     * 执行并获取每个节点的执行结果
     * @return BTResult
     */
    excute(): BTResult {
        cc.error("need inhert");
        return BTResult.suc;
    }

    /**
     * 执行每个节点的行动（只有running时有行动）
     */
    doAction() {

    }

    update(dt: number) {
        if (!CC_EDITOR) return;
        this.node.name = this.typeString + ": " + this.getBTName();
    }

    getBTName(): string {
        cc.error("need inhert");
        return "";
    }

    isRunning(): boolean {
        return false;
    }

    endRunning() {

    }
}
