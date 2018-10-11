// FigureDisplay.ts
// 数字展示器，把数字和相关内容显示到当前节点的相应位置
// 可以展示伤害数字和闪躲标识
// 伤害暴击有特殊效果，不同类型伤害有不同颜色
// lly 2018.3.25

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import MyNodePool from "./MyNodePool";

let lblActParams: number[][] = [
    [17, 16], [3, 21], [23, 6], [11, 19],
    [22, 29], [2, 27], [20, 8], [13, 26]
];
let actParamsIndex: number = 0;

@ccclass
export default class FigureDisplay extends MyComponent {

    @property(cc.Prefab)
    labelPrefab: cc.Prefab = null;

    pool: MyNodePool = null;

    z: number = 1;

    onLoad() {
        this.pool = new MyNodePool((): cc.Node => {
            return cc.instantiate(this.labelPrefab);
        }, 20, "FigureDisplay", this.node);
    }

    showFigure(pos: cc.Vec2, hurtDir: number, figure: number, crit: boolean, color: cc.Color) {
        if (figure == 0) return;

        // 获取或者生成label
        let labelNode: cc.Node = this.pool.get();

        // 配置属性
        labelNode.position = pos;
        this._resetLabel(
            labelNode,
            color,
            Math.floor(figure).toString() + (crit ? "!" : "")
        )

        // 执行动画
        this._doAction(labelNode, hurtDir * -1);
        if (crit) this._doCritAction(labelNode);
    }

    showEvade(pos: cc.Vec2) {
        let labelNode: cc.Node = this.pool.get();

        labelNode.position = pos;
        this._resetLabel(
            labelNode,
            cc.Color.BLUE,
            "Evade"
        );

        this._doAction(labelNode, 0);
    }

    _resetLabel(labelNode: cc.Node, color: cc.Color, str: string) {
        labelNode.color = color;
        labelNode.opacity = 255;
        labelNode.scale = 1;

        let label = labelNode.getComponent(cc.Label);
        label.string = str;

        labelNode.zIndex = this.z;
        this.z++;
    }

    _doAction(labelNode: cc.Node, dir: number) {
        let params = lblActParams[actParamsIndex];
        actParamsIndex++;
        if (actParamsIndex >= lblActParams.length) actParamsIndex = 0;

        let p = cc.v2((50 + params[0])  * dir, 0);
        let h = 30 + params[1];
        labelNode.runAction(cc.jumpBy(1, p, h, 1).easing(cc.easeSineOut()));
        labelNode.runAction(cc.sequence(
            cc.delayTime(0.6),
            cc.fadeOut(0.1),
            cc.callFunc(() => {
                labelNode.stopAllActions();
                this.pool.reclaim(labelNode);
            })
        ));
    }

    _doCritAction(labelNode: cc.Node) {
        labelNode.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.7),
            cc.scaleTo(0.1, 1.3)
        ));
    }
}
