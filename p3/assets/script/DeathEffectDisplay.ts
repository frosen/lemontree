// DeathEffectDisplay.ts
// Enemy死亡时候，在相应的地方展示死亡效果
// lly 2018.3.25

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import MyNodePool from "./MyNodePool";

@ccclass
export default class DeathEffectDisplay extends MyComponent {

    @property(cc.Prefab)
    deathPrefab: cc.Prefab = null;

    pool: MyNodePool = null;

    onLoad() {
        this.pool = new MyNodePool((_: MyNodePool): cc.Node => {
            let labelNode = this.creatDeathNode(); // 创建节点
            return labelNode;
        }, 20, "DeathEffect", this.node);
    }

    creatDeathNode(): cc.Node {
        let labelNode = cc.instantiate(this.deathPrefab); // 创建节点
        let anim = labelNode.getComponent(cc.Animation);
        anim.on("finished", (event: Event) => {
            this.pool.reclaim(labelNode);
        });

        return labelNode;
    }

    showDeathEffect(pos: cc.Vec2) {
        // 获取或者生成label
        let labelNode: cc.Node = this.pool.get();

        // 配置属性
        labelNode.position = pos;

        // 执行动画
        this._doAction(labelNode);
    }

    _doAction(effectNode: cc.Node) {
        let anim = effectNode.getComponent(cc.Animation);
        anim.play();
    }
}