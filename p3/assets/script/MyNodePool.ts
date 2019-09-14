// MyNodePool.ts
// 自定义的node对象池：
// 第一是因为不需要变化parent，变化parent效率比较低；
// 第二是为了直接获取pool进行遍历，而原来的并没有接口

export default class MyNodePool {
    /** 节点池 */
    pool: cc.Node[] = [];
    /** 组件池，为了省去获得节点后再查找组件的过程 */
    compPool: any[] = [];

    /** 节点生成函数 */
    nodeCreateFunc: (pool: MyNodePool) => cc.Node = null;
    /** 名称 */
    name: string = '';
    /** 父节点 */
    parent: cc.Node = null;
    /** 要获得的组件类型 */
    compType: { prototype: cc.Component } = null;
    /** 初始化以后，是否允许自动增加新节点 */
    autoCreate: boolean = true;

    /**
     * 构造器
     * @param 节点生成函数
     * @param 起始时节点保有数量
     * @param 节点池名称 可为空
     * @param 节点的父节点 可空
     */
    constructor(
        nodeCreateFunc: (pool: MyNodePool) => cc.Node,
        nodeCount: number,
        name: string = '',
        parent: cc.Node = null,
        compType: { prototype: cc.Component } = null,
    ) {
        this.nodeCreateFunc = nodeCreateFunc;
        this.name = name;
        this.parent = parent;
        this.compType = compType;

        for (let index = 0; index < nodeCount; index++) {
            let n = nodeCreateFunc(this);
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

        if (this.compType) {
            let c = node.getComponent(this.compType);
            this.compPool.push(c);
        }
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

        if (this.autoCreate) {
            // 如果没有节点了，就自动添加
            let n = this.nodeCreateFunc(this);
            this._put(n, true);

            return n;
        } else {
            cc.error('this pool can not create new node');
            return null;
        }
    }

    getComp(): any {
        for (let index = 0; index < this.pool.length; index++) {
            let node = this.pool[index];
            if (node.active == false) {
                node.active = true;
                return this.compPool[index];
            }
        }

        if (this.autoCreate) {
            // 如果没有节点了，就自动添加
            let n = this.nodeCreateFunc(this);
            this._put(n, true);
            return n.getComponent(this.compType);
        } else {
            cc.error('this pool can not create new node');
            return null;
        }
    }

    reclaim(node: cc.Node) {
        this._setNodeUsing(node, false);
    }

    reclaimOtherFrom(index: number) {
        let i = index;
        while (i < this.pool.length) {
            let node = this.pool[i];
            this._setNodeUsing(node, false);
            i++;
        }
    }

    reclaimAll() {
        for (let index = 0; index < this.pool.length; index++) {
            this._setNodeUsing(this.pool[index], false);
        }
    }

    //========================================================

    getByIndex(index: number): cc.Node {
        if (index < this.pool.length) {
            let node = this.pool[index];
            node.active = true;
            return node;
        } else if (this.autoCreate) {
            let l = this.pool.length;
            let n: cc.Node;
            for (let i = l; i <= index; i++) {
                n = this.nodeCreateFunc(this);
                this._put(n, true);
            }
            return n;
        } else {
            cc.error('this pool can not create new node');
            return null;
        }
    }

    getCompByIndex(index: number): any {
        if (index < this.pool.length) {
            let node = this.pool[index];
            node.active = true;
            return this.compPool[index];
        } else if (this.autoCreate) {
            let l = this.pool.length;
            let n: cc.Node;
            for (let i = l; i <= index; i++) {
                n = this.nodeCreateFunc(this);
                this._put(n, true);
            }
            return n.getComponent(this.compType);
        } else {
            cc.error('this pool can not create new node');
            return null;
        }
    }

    each(call: (n: cc.Node, using: boolean) => void) {
        for (const node of this.pool) {
            call(node, node.active);
        }
    }

    eachComp(call: (c: any, using: boolean) => void) {
        for (let index = 0; index < this.pool.length; index++) {
            call(this.compPool[index], this.pool[index].active);
        }
    }
}
