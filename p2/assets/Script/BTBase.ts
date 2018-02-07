// BTBase.ts
// 行为树基础类，
// 遍历其所有子节点，每个子节点必须是行为树节点
// 会隐藏其所有子节点，提高渲染效率
// 
// lly 2018.2.5

const {ccclass, property} = cc._decorator;

@ccclass
export default class BTBase extends cc.Component {

    onLoad() {
        // 隐藏其子节点
        for (const node of this.node.children) {
            node.active = false;
        }
        
    }

    update(dt: number) {
        // 遍历子节点执行其行为
    }
}
