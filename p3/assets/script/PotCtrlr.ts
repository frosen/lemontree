// PotCtrlr.ts
// 水罐管理器，水罐就是场景中的可破坏物：
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import Pot from "./Pot";
import MyNodePool from "./MyNodePool";
import {GroundInfo} from "./MapCtrlr";

class PotInfo {
    frame: cc.SpriteFrame;
    c1: cc.Color;
    c2: cc.Color;
}

class PotData {
    pos: cc.Vec2;
    living: boolean;
    info: PotInfo;

    constructor(pos: cc.Vec2, info: PotInfo) {
        this.pos = pos;
        this.living = true;
        this.info = info;
    }
}

@ccclass
export default class PotCtrlr extends MyComponent {

    @property([cc.Node])
    showingPots: cc.Node[] = [];

    pool: MyNodePool = null;

    infos: PotInfo[][] = [];

    /** 每个区域的水罐位置 */
    datas: PotData[][] = [];

    curScene: number = 1; //从1开始
    curArea: number = 1; //从1开始

    onLoad() {
        // 生成节点池
        this.pool = new MyNodePool((_: MyNodePool): cc.Node => {
            let node = new cc.Node();
            node.addComponent(Pot);
            node.setAnchorPoint(0.5, 0);
            return node;
        }, 30, "pot", this.node, Pot);

        this._createShowingPots();
    }

    _createShowingPots() {
        for (const node of this.showingPots) {
            if (node.active == false) continue;
            node.setAnchorPoint(0.5, 0);
            let pot = node.addComponent(Pot);
            let sp = node.getComponent(cc.Sprite);
            let frame = sp.spriteFrame;
            let name = frame.name;
            let datas = name.split("_");

            pot.setData(null, frame, cc.hexToColor(datas[1]), cc.hexToColor(datas[2]));
        }
    }

    setSceneAndLoadRes(sceneIndex: number, finishCallback: () => void) {
        this.curScene = sceneIndex;
        if (this.infos[sceneIndex]) return finishCallback();

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir(`map/scene${sceneIndex}/pot`, cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }
            this._onGotFrames(sceneIndex, frames);
            return finishCallback();
        });
    }

    /**
     * 获得纹理后，进行解析
     */
    _onGotFrames(sceneIndex: number, frames: cc.SpriteFrame[]) {
        let potInfos = [];
        for (const frame of frames) {
            let name = frame.name;
            let datas = name.split("_");
            let info = new PotInfo();
            info.frame = frame;
            info.c1 = cc.hexToColor(datas[1]);
            info.c2 = cc.hexToColor(datas[2]);
            potInfos.push(info);
        }

        this.infos[sceneIndex] = potInfos;
    }

    setData(areaIndex: number, poss: {pos: cc.Vec2, ground: GroundInfo}[]) {
        let data = [];
        let potInfos = this.infos[this.curScene];
        let len = potInfos.length;
        for (const pos of poss) {
            let r = Math.random() * len;
            let k = Math.floor(r);
            data.push(new PotData(pos.pos, potInfos[k]));
        }
        this.datas[areaIndex] = data;
    }

    changeArea(areaIndex: number) {
        this.curArea = areaIndex;
        let potDatas: PotData[] = this.datas[areaIndex];
        if (!potDatas) return;

        let index = 0;
        for (const data of potDatas) {
            if (data.living == false) continue;

            let pot: Pot = this.pool.getCompByIndex(index);
            pot.node.setPosition(data.pos);
            let info = data.info;
            pot.setData(index, info.frame, info.c1, info.c2);

            index++;
        }
        this.pool.reclaimOtherFrom(index);
    }

    killPot(pot: Pot) {
        let index = pot.ctrlrIndex;
        if (index != null) {
            this.datas[this.curArea][index].living = false;
            this.pool.reclaim(pot.node);
        } else { // 没有index说明不是从pool中生成的
            pot.node.removeFromParent();
        }
    }

    /**
     * 获取还存在的pot的数量
     */
    getPotRemainsCount(): number {
        let datas = this.datas[this.curArea];
        let count: number = 0;
        for (const data of datas) {
            if (data.living) count++;
        }
        return count;
    }
}
