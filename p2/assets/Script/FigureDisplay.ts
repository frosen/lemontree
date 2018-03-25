// FigureDisplay.ts
// 数字展示器，把数字和相关内容显示到当前节点的相应位置
// 可以展示伤害数字和闪躲标识
// 伤害暴击有特殊效果，不同类型伤害有不同颜色
// lly 2018.3.25

const {ccclass, property} = cc._decorator;

@ccclass
export default class FigureDisplay extends cc.Component {

    @property(cc.Prefab)
    labelPrefab: cc.Prefab = null;

    pool: cc.NodePool = null;

    onLoad() {        
        this.pool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; ++i) {
            let labelNode = cc.instantiate(this.labelPrefab); // 创建节点
            this.pool.put(labelNode); // 通过 putInPool 接口放入对象池
        }
    }

    showFigure(pos: cc.Vec2, figure: number, crit: boolean, magic: boolean) {
        // 获取或者生成label
        let labelNode: cc.Node = this._getLabelNode();

        // 配置属性
        labelNode.position = pos;
        this._resetLabel(
            labelNode, 
            magic ? cc.Color.BLUE : cc.Color.RED,
            Math.floor(figure).toString() + (crit ? "!" : "")
        )

        // 执行动画       
        this._doAction(labelNode);
        if (crit) this._doCritAction(labelNode);        
    }

    showEvade(pos: cc.Vec2) {
        let labelNode: cc.Node = this._getLabelNode();

        labelNode.position = pos;
        this._resetLabel(
            labelNode, 
            cc.Color.BLUE,
            "Evade"
        )
        this._doAction(labelNode);
    }

    _getLabelNode(): cc.Node {
        let labelNode: cc.Node;
        if (this.pool.size() > 0) {
            labelNode = this.pool.get();
        } else {
            labelNode = cc.instantiate(this.labelPrefab);
            this.pool.put(labelNode);
        }
        labelNode.parent = this.node;
        return labelNode;
    }

    _resetLabel(labelNode: cc.Node, color: cc.Color, str: string) {
        labelNode.color = color;
        labelNode.opacity = 255;
        labelNode.scale = 1;
        
        let label = labelNode.getComponent(cc.Label);
        label.string = str;
    }

    _doAction(labelNode: cc.Node) {
        labelNode.runAction(cc.sequence(
            cc.moveBy(0.2, 0, 30).easing(cc.easeSineOut()),
            cc.delayTime(0.4),
            cc.fadeOut(0.1),
            cc.callFunc(() => {
                this.pool.put(labelNode);
            })
        ))
    }

    _doCritAction(labelNode: cc.Node) {
        labelNode.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.7),
            cc.scaleTo(0.1, 1.3)
        ));
    }
}