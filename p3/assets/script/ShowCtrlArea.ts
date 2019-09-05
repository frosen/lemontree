// ShowCtrlArea.ts
// 在屏幕中显示出控制区域，对测试也很有用
// lly 2017.12.30

const { ccclass, property, executeInEditMode } = cc._decorator;

import MyComponent from './MyComponent';
import HeroOperator from './HeroOperator';

@ccclass
@executeInEditMode
export default class ShowCtrlArea extends MyComponent {
    @property(HeroOperator)
    operator: HeroOperator = null;

    @property(cc.Node)
    moveArea: cc.Node = null;

    @property(cc.Node)
    watchArea: cc.Node = null;

    @property(cc.Node)
    jumpArea: cc.Node = null;

    @property(cc.Node)
    dashArea: cc.Node = null;

    onLoad() {
        let size = cc.find('canvas').getContentSize();

        this.moveArea.setPosition(0, 0);
        this.moveArea.setContentSize(size.width * this.operator.moveWRate, size.height * this.operator.moveHRate);

        this.watchArea.setPosition(0, size.height * this.operator.moveHRate);
        this.watchArea.setContentSize(size.width * this.operator.moveWRate, size.height * (1 - this.operator.moveHRate));

        this.jumpArea.setPosition(size.width, 0);
        this.jumpArea.setContentSize(size.width * (1 - this.operator.jumpXRate), size.height * this.operator.jumpHRate);

        this.dashArea.setPosition(size.width, size.height * this.operator.jumpHRate);
        this.dashArea.setContentSize(size.width * (1 - this.operator.jumpXRate), size.height * (1 - this.operator.jumpHRate));
    }
}
