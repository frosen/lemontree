// PotCtrlr.ts
// 水罐管理器，水罐就是场景中的可破坏物：
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import Pot from "./Pot";
import MyNodePool from "./MyNodePool";

class PotInfo {
    frame: cc.SpriteFrame = null;
    c1: cc.Color = null;
    c2: cc.Color = null;
    width: number = 0;
}

@ccclass
export default class PotCtrlr extends cc.Component {

    @property([cc.Node])
    showingPots: cc.Node[] = [];

    pool: MyNodePool = null;

    potInfos: PotInfo[] = [];

    onLoad() {
        // 生成节点池
        this.pool = new MyNodePool((): cc.Node => {
            let node = new cc.Node();
            node.addComponent(Pot);
            return node;
        }, 30, "pot", this.node); 

        this._createShowingPots();
    }

    _createShowingPots() {
        for (const node of this.showingPots) {
            let pot = node.addComponent(Pot);
            let sp = node.getComponent(cc.Sprite);
            let frame = sp.spriteFrame;
            let name = frame.name;
            let datas = name.split("_");

            pot.setData(frame, cc.hexToColor(datas[1]), cc.hexToColor(datas[2]), 
                frame.getOriginalSize().width - parseInt(datas[3]));
        }
    }

    loadRes(dir: string) {
        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir("pots", cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }
            this._onGotFrames(frames);
        });
    }

    /**
     * 获得纹理后，进行解析
     */
    _onGotFrames(frames: cc.SpriteFrame[]) {
        this.potInfos = [];
        for (const frame of frames) {
            let name = frame.name;
            let datas = name.split("_");
            let info = new PotInfo();
            info.frame = frame;
            info.c1 = cc.hexToColor(datas[1]);
            info.c2 = cc.hexToColor(datas[2]);
            info.width = frame.getOriginalSize().width - parseInt(datas[3]);
            this.potInfos.push(info);
        }
    }

    
}
