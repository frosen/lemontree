// PotCtrlr.ts
// 水罐管理器，水罐就是场景中的可破坏物：
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

@ccclass
export default class PotCtrlr extends cc.Component {

    @property([cc.Node])
    showingPots: cc.Node[] = [];

    onLoad() {

    }

}
