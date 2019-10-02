// PotCtrlr.ts
// 水罐管理器，水罐就是场景中的可破坏物：
// lly 2018.5.12

const { ccclass, property, executeInEditMode } = cc._decorator;

import MyComponent from './MyComponent';
import { GameCtrlr } from './GameCtrlr';
import Pot from './Pot';
import MyNodePool from './MyNodePool';
import { GroundInfo } from './MapCtrlr';

const PotInfo = cc.Class({
    name: 'PotInfo',
    properties: {
        frame: {
            type: cc.SpriteFrame,
            default: null,
            displayName: '纹理',
        },
        c1: {
            default: cc.Color.WHITE,
            displayName: '颜色1',
        },
        c2: {
            default: cc.Color.WHITE,
            displayName: '颜色2',
        },
    },
});

type PotInfo = { frame: cc.SpriteFrame; c1: cc.Color; c2: cc.Color };

const PotInfos = cc.Class({
    name: 'PotInfos',
    properties: {
        sceneIndex: {
            default: 0,
            displayName: '场景序号',
            readonly: true,
        },
        infos: {
            type: PotInfo,
            default: [],
            displayName: '本场景罐数据',
        },
    },
});

type PotInfos = { sceneIndex: number; infos: PotInfo[] };

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
@executeInEditMode
export default class PotCtrlr extends MyComponent {
    @property({
        type: [PotInfos],
        displayName: '罐数据',
    })
    infos: PotInfos[] = [];

    gameCtrlr: GameCtrlr = null;

    pool: MyNodePool = null;

    /** 每个区域的水罐位置 */
    datas: PotData[][] = [];

    onLoad() {
        if (CC_EDITOR) return;

        this.gameCtrlr = cc.find('main').getComponent(GameCtrlr);

        // 生成节点池
        this.pool = new MyNodePool(
            (_: MyNodePool): cc.Node => {
                let node = new cc.Node();
                node.name = 'pot';
                node.addComponent(Pot);
                node.setAnchorPoint(0.5, 0);
                return node;
            },
            30,
            'pot',
            this.node,
            Pot,
        );
    }

    update() {
        if (CC_EDITOR) {
            this.check();
        }
    }

    setData(areaIndex: number, groundInfos: GroundInfo[]) {
        if (groundInfos.length == 0) return;

        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let data = [];
        let potInfos = this.infos[curSceneIndex].infos;
        let len = potInfos.length;
        for (const groundInfo of groundInfos) {
            let r = Math.random() * len;
            let k = Math.floor(r);
            data.push(new PotData(cc.v2(groundInfo.pX, groundInfo.pY), potInfos[k]));
        }
        this.datas[areaIndex] = data;
    }

    changeArea() {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        let potDatas: PotData[] = this.datas[curAreaIndex];
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

    clear() {
        this.pool.reclaimAll();
        this.datas = [];
    }

    killPot(pot: Pot) {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        let index = pot.ctrlrIndex;
        if (index != null) {
            this.datas[curAreaIndex][index].living = false;
            this.pool.reclaim(pot.node);
        } else {
            // 没有index说明不是从pool中生成的
            pot.node.destroy();
        }
    }

    /**
     * 获取还存在的pot的数量
     */
    getPotRemainsCount(): number {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        let datas = this.datas[curAreaIndex];
        let count: number = 0;
        for (const data of datas) {
            if (data.living) count++;
        }
        return count;
    }

    // ========================================================

    @property({
        visible: false,
        editorOnly: true,
    })
    _ct: number = 0;

    check() {
        this._ct++;
        if (this._ct > 10) {
            this._ct = 0;
            for (let index = 0; index < this.infos.length; index++) {
                const info = this.infos[index];
                info.sceneIndex = index;
            }
        }
    }
}
