// BTNode.ts
// 行为树节点基类，各种行为树节点行为继承于此类
// 
// lly 2018.2.5

const {ccclass, property, executeInEditMode, disallowMultiple} = cc._decorator;

export enum BTResult {
    suc,
    fail,
    running,
    noRunning,
}

@ccclass
@executeInEditMode
@disallowMultiple
export class BTNode extends cc.Component {

    typeString: string = "";

    excute(): BTResult {
        cc.error("need inhert");
        return BTResult.suc;
    }

    update() {
        this.node.name = this.typeString + ": " + this.getBTName();
    }

    getBTName(): string {
        return "";
    }

    checkRunningEnd(): boolean {
        return false;
    }

    isRunning(): boolean {
        return false;
    }

    endRunning() {

    }
}
