// BTNode.ts
// 行为树节点基类，各种行为树节点行为继承于此类
// 
// lly 2018.2.5

const {ccclass, property, executeInEditMode, disallowMultiple} = cc._decorator;

@ccclass
@executeInEditMode
@disallowMultiple
export default class BTNode extends cc.Component {

    typeString: string = "";

    excute() {
        cc.error("need inhert");
    }

    update() {
        this.node.name = this.typeString + ": " + this.getBTName();
    }

    getBTName(): string {
        return "";
    }
}
