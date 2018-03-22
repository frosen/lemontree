// CtrlIndicator.ts
// 控制指示：显示控制器的位置标识和状态
// lly 2017.12.12

const {ccclass, property} = cc._decorator;
import HeroCtrlr from "./HeroCtrlr";

@ccclass
export default class CtrlIndicator extends cc.Component {

    /** 英雄控制器 */
    @property(HeroCtrlr)
    ctrlr: HeroCtrlr = null;

    /** 标记精灵 */
    sp: cc.Sprite = null;

    onLoad() {
        requireComponents(this, [cc.Sprite]);

        this.sp = this.getComponent(cc.Sprite);       
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

