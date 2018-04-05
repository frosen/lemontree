// DeathEffectDisplay.ts
// Enemy死亡时候，在相应的地方展示死亡效果
// lly 2018.3.25

const {ccclass, property} = cc._decorator;

@ccclass
export default class DeathEffectDisplay extends cc.Component {

    @property(cc.Prefab)
    deathPrefab: cc.Prefab = null;

    pool: cc.NodePool = null;

    onLoad() {        
        this.pool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; ++i) {
            let labelNode = this.creatDeathNode(); // 创建节点
            this.pool.put(labelNode); // 通过 putInPool 接口放入对象池
        }
    }

    creatDeathNode(): cc.Node {
        let labelNode = cc.instantiate(this.deathPrefab); // 创建节点
        let anim = labelNode.getComponent(cc.Animation);
        anim.on("finished", (event: Event) => {
            cc.log("finished");
            this.pool.put(labelNode);
        });

        return labelNode;
    }

    showDeathEffect(pos: cc.Vec2) {
        // 获取或者生成label
        let labelNode: cc.Node = this._getEffectNode();

        // 配置属性
        labelNode.position = pos;

        // 执行动画       
        this._doAction(labelNode);      
    }

    _getEffectNode(): cc.Node {
        let effectNode: cc.Node;
        if (this.pool.size() > 0) {
            effectNode = this.pool.get();
        } else {
            effectNode = this.creatDeathNode();
            this.pool.put(effectNode);
        }
        effectNode.parent = this.node;
        return effectNode;
    }

    _doAction(effectNode: cc.Node) {
        let anim = effectNode.getComponent(cc.Animation);
        anim.play();
    }
}