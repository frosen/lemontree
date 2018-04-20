// ItemCtrlr.ts
// 道具控制器，负责持有和生成道具：
// lly 2018.4.12

const {ccclass, property,} = cc._decorator;

import { MovableObject } from "./MovableObject";

import ItemComp from "./ItemComp";
import Item from "./Item";

import { ItemExp1 } from "./ItemExp";

class ItemInfo {
    item: Item = null;
    frames: cc.SpriteFrame[] = [];
    times: number[] = [];

    constructor(item: Item) {
        this.item = item;
        let frameInfo = item.getFrameInfos();
        for (const info of frameInfo) {
            this.times.push(info.time);
        }
    }
}

@ccclass
export default class ItemCtrlr extends cc.Component {

    pool: cc.NodePool = null;

    itemInfos: {[key: string]: ItemInfo;} = {};

    onLoad() {
        // 生成节点池
        this.pool = new cc.NodePool();
        let initCount: number = 20;
        for (let i = 0; i < initCount; ++i) {
             this._createNewItemNode();
        }

        // 加载所有的道具
        this._pushItemIntoInfo(ItemExp1);

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir("items", cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }
            this._onGotFrames(frames)
        });
    }

    _createNewItemNode(): {node: cc.Node, itemComp: ItemComp} {
        let node = new cc.Node();
        let itemComp = node.addComponent(ItemComp);
        itemComp.itemCtrlr = this;
        this.pool.put(node);
        return {node, itemComp};
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

            myAssert(itemInfo.frames.length == itemInfo.times.length, "maybe wrong item name in png");
        }
    }

    _beginItemNode(itemName: string, pos: cc.Vec2, moveX: number, moveY: number) {
        let node: cc.Node;
        let itemComp: ItemComp;
        if (this.pool.size() > 0) {
            node = this.pool.get();
            itemComp = node.getComponent(ItemComp);
        } else {
            let {node, itemComp} = this._createNewItemNode();
        }

        node.parent = this.node;
        node.position = pos;

        let {item, frames, times} = this.itemInfos[itemName];
        itemComp.setData(item, frames, times);

        itemComp.move(moveX, moveY);
    }

    // 生成道具 ========================================================

    createItem(pos: cc.Vec2) {
        // 计算有几个道具，分别是什么
        let itemNames = ["ItemExp1", "ItemExp1", "ItemExp1", "ItemExp1", "ItemExp1"];

        // 开始节点
        let xNum = 0;
        let xDirIsLeft = true;
        for (const name of itemNames) {
            let x = xNum * (xDirIsLeft ? -1 : 1);
            let y = 7 + Math.random() * 0.5;
            let node = this._beginItemNode(name, pos, x, y);

            xNum = 0.1 + Math.random() * 0.8;
            xDirIsLeft = !xDirIsLeft;
        }
    }

    removeItem(itemComp: ItemComp) {
        let node: cc.Node = itemComp.node;
        this.pool.put(node);
    }
}
