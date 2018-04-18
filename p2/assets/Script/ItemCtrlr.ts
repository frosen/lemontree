// ItemCtrlr.ts
// 道具控制器，负责持有和生成道具：
// lly 2018.4.12

const {ccclass, property,} = cc._decorator;

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
             this.createNewItemNode();
        }

        // 加载所有的道具
        this.pushItemIntoInfo(ItemExp1);

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir("items", cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }
            this.onGotFrames(frames)
        });
    }

    createNewItemNode(): cc.Node {
        let node = new cc.Node();
        node.addComponent(ItemComp);
        this.pool.put(node);
        return node;
    }

    pushItemIntoInfo(itemType: {new()}) {
        this.itemInfos[getClassName(itemType)] = new ItemInfo(new itemType());
    }

    /**
     * 获得纹理后，进行解析
     */
    onGotFrames(frames: cc.SpriteFrame[]) {
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
}
