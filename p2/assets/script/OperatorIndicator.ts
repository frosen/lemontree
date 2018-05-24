// OperatorIndicator.ts
// 控制指示：显示控制器的位置标识和状态
// lly 2017.12.12

const {ccclass, property} = cc._decorator;
import HeroOperator from "./HeroOperator";

@ccclass
export default class OperatorIndicator extends cc.Component {

    /** 英雄控制器 */
    @property(HeroOperator)
    operator: HeroOperator = null;

    /** 标记精灵 */
    sp: cc.Sprite = null;

    onLoad() {
        requireComponents(this, [cc.Sprite]);

        this.sp = this.getComponent(cc.Sprite);       
    }

    update(_: number) {
        let beginPos = this.operator.moveBeginPos;

        if (!beginPos) {
            this.sp.enabled = false;
        } else {
            this.sp.enabled = true;
            this.node.position = beginPos;
        }
    }
}

