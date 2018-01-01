// ShowCtrlArea.ts
// 在屏幕中显示出控制区域，对测试也很有用
// lly 2017.12.30

const {ccclass, property, executeInEditMode} = cc._decorator;
import HeroController from "./HeroController";

@ccclass
@executeInEditMode
export default class ShowCtrlArea extends cc.Component {

    @property(HeroController)
    ctrl: HeroController = null;

    @property(cc.Node)
    moveArea: cc.Node = null;

    @property(cc.Node)
    watchArea: cc.Node = null;

    @property(cc.Node)
    jumpArea: cc.Node = null;

    @property(cc.Node)
    dashArea: cc.Node = null;

    onLoad() {
        let size = cc.find("canvas").getContentSize();

        this.moveArea.setPosition(0, 0);
        this.moveArea.setContentSize(size.width * this.ctrl.moveWRate, size.height * this.ctrl.moveHRate);

        this.watchArea.setPosition(0, size.height * this.ctrl.moveHRate);
        this.watchArea.setContentSize(size.width * this.ctrl.moveWRate, size.height * (1 - this.ctrl.moveHRate));

        this.jumpArea.setPosition(size.width, 0);
        this.jumpArea.setContentSize(size.width * (1 - this.ctrl.jumpXRate), size.height * this.ctrl.jumpHRate);

        this.dashArea.setPosition(size.width, size.height * this.ctrl.jumpHRate);
        this.dashArea.setContentSize(size.width * (1 - this.ctrl.jumpXRate), size.height * (1 - this.ctrl.jumpHRate));
    }
}
