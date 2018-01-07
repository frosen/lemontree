// CtrlIndicator.ts
// 控制指示：显示控制器的位置标识和状态
// lly 2017.12.12

const {ccclass, property, requireComponent} = cc._decorator;
import HeroController from './HeroController';

@ccclass
@requireComponent(cc.Sprite)
export default class CtrlIndicator extends cc.Component {

    /** 英雄控制器 */
    @property(HeroController)
    ctrlr: HeroController = null;

    /** 标记精灵 */
    sp: cc.Sprite = null;

    onLoad() {
        this.sp = this.node.getComponent(cc.Sprite);
    }

    update() {
        let beginPos = this.ctrlr.moveBeginPos;

        if (!beginPos) {
            this.sp.enabled = false;
        } else {
            this.sp.enabled = true;
            this.node.position = beginPos;
        }
    }
}

