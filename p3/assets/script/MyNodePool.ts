// MyNodePool.ts
// 自定义的node对象池：
// 第一是因为不需要变化parent，变化parent效率比较低；
// 第二是为了直接获取pool进行遍历，而原来的并没有接口

export default class MyNodePool {

    pool: cc.Node[] = [];

    nodeCreateFunc: () => cc.Node = null;
    name: string = "";
    parent: cc.Node = null;

    /**
     * 构造器
     * @param 节点生成函数
     * @param 起始时节点保有数量
     * @param 节点池名称 可为空
     * @param 节点的父节点 可空
     */
    constructor(nodeCreateFunc: () => cc.Node, nodeCount: number, name: string = "", parent: cc.Node = null) {
        this.nodeCreateFunc = nodeCreateFunc;
        this.name = name;
        this.parent = parent;

        for (let index = 0; index < nodeCount; index++) {
            let n = nodeCreateFunc();
            this._put(n);
        }
    }

    _put(node: cc.Node, using: boolean = false) {
        if (!node) {
            cc.log(`wrong node in MyNodePool ${this.name}`);
            return;
        }

        for (const innerNode of this.pool) {
            if (innerNode == node) {
                cc.log(`MyNodePool ${this.name} has same node`);
                return;
            }
        }

        if (this.parent && node.parent != this.parent) {
            node.removeFromParent(false);
            node.parent = this.parent;
        }

        this.pool.push(node);

        this._setNodeUsing(node, using);
    }

    _setNodeUsing(node: cc.Node, b: boolean) {
        node.active = b; // 目前使用active来判别是否是活跃状态
    }

    //========================================================

    get(): cc.Node {
        for (const node of this.pool) {
            if (node.active == false) {
                node.active = true;
                return node;
            }
        }

        // 如果没有节点了，就自动添加
        let n = this.nodeCreateFunc();
        this._put(n, true);

        return n;
    }

    reclaim(node: cc.Node) {
        this._setNodeUsing(node, false);
    }
}
