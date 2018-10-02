// ItemCtrlr.ts
// 道具控制器，负责持有和生成道具：
// lly 2018.4.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import AttriForHero from "./AttriForHero";
import MyNodePool from "./MyNodePool";

import ItemComp from "./ItemComp";
import Item from "./Item";

import {ItemExp1} from "./ItemExp";
import {ItemHealthPot} from "./ItemEfc";

class ItemInfo {
    item: Item = null;
    frames: cc.SpriteFrame[] = [];
    times: number[] = [];
    magnetic: boolean = false;

    constructor(item: Item) {
        this.item = item;
        let frameInfo = item.getFrameInfos();
        for (const info of frameInfo) {
            this.times.push(info.time);
        }
        this.magnetic = item.isMagnetic();
    }
}

@ccclass
export default class ItemCtrlr extends MyComponent {

    @property([cc.Node])
    showingItems: cc.Node[] = [];

    heroAttri: AttriForHero = null;

    pool: MyNodePool = null;

    itemInfos: {[key: string]: ItemInfo;} = {};

    onLoad() {
        this.heroAttri = cc.find("main/hero_layer/hero").getComponent("Hero").attri;

        // 生成节点池
        this.pool = new MyNodePool((): cc.Node => {
            let node = new cc.Node();
            let itemComp = node.addComponent(ItemComp);
            itemComp.itemCtrlr = this;
            return node;
        }, 20, "item", this.node);

        // 加载所有的道具
        this._pushItemIntoInfo(ItemExp1);

        this._pushItemIntoInfo(ItemHealthPot);

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir("items", cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }
            this._onGotFrames(frames);
        });
    }

    _pushItemIntoInfo(itemType: {new()}) {
        this.itemInfos[getClassName(itemType)] = new ItemInfo(new itemType());
    }

    /**
     * 获得纹理后，进行解析
     */
    _onGotFrames(frames: cc.SpriteFrame[]) {
        for (const key in this.itemInfos) {
            const itemInfo = this.itemInfos[key];
            let frameInfo = itemInfo.item.getFrameInfos();
            for (const info of frameInfo) {
                let needFrameName = info.frameName;
                for (const frame of frames) {
                    if (needFrameName == frame.name) {
                        itemInfo.frames.push(frame);
                        break;
                    }
                }
            }

            cc.assert(itemInfo.frames.length == itemInfo.times.length, "maybe wrong item name in png");
        }

        // 如果有需要直接安置的item，在此生成
        for (const itemNode of this.showingItems) {
            let itemComp = itemNode.addComponent(ItemComp);
            itemComp.itemCtrlr = this;

            let {item, frames, times} = this.itemInfos[itemNode.name];
            itemComp.setData(item, frames, times);
        }
    }

    _beginItemNode(itemName: string, pos: cc.Vec2, moveX: number, moveY: number) {
        let node: cc.Node = this.pool.get();
        let itemComp: ItemComp = node.getComponent(ItemComp);

        let {item, frames, times, magnetic} = this.itemInfos[itemName];
        itemComp.setData(item, frames, times);
        itemComp.watching = magnetic && this.heroAttri.magnetic;

        node.position = pos;
        itemComp.move(moveX, moveY);
    }

    // 生成道具 ========================================================

    createItem(pos: cc.Vec2) {
        // 计算有几个道具，分别是什么
        let itemNames = ["ItemExp1", "ItemExp1", "ItemExp1", "ItemExp1", "ItemHealthPot"];

        // 开始节点
        let xNum = 0;
        let xDirIsLeft = true;
        for (const name of itemNames) {
            let x = xNum * (xDirIsLeft ? -1 : 1);
            let y = 7 + Math.random() * 0.5;
            this._beginItemNode(name, pos, x, y);

            xNum = 0.1 + Math.random() * 0.8;
            xDirIsLeft = !xDirIsLeft;
        }
    }

    removeItem(itemComp: ItemComp) {
        let node: cc.Node = itemComp.node;
        this.pool.reclaim(node);
    }

    // ========================================================

    clear() {
        this.pool.reclaimOtherFrom(0);
    }
}
