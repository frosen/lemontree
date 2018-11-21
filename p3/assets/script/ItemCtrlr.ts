// ItemCtrlr.ts
// 道具控制器，负责持有和生成道具：
// lly 2018.4.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import AttriForHero from "./AttriForHero";
import EnemyCtrlr from "./EnemyCtrlr";
import PotCtrlr from "./PotCtrlr";

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

export enum ItemSource {
    enemy,
    pot
}

@ccclass
export class ItemCtrlr extends MyComponent {

    @property([cc.Node])
    showingItems: cc.Node[] = [];

    heroAttri: AttriForHero = null;
    enemyCtrlr: EnemyCtrlr = null;
    potCtrlr: PotCtrlr = null;

    pool: MyNodePool = null;

    itemInfos: {[key: string]: ItemInfo;} = {};

    // ========================================================

    /** 经验基数 */
    expBase: number = 0;
    /** 经验池 */
    expPool: number = 0;

    /** 物品掉落概率池 */
    mfRate: number = 0;
    /** 高级物品掉落概率池 */
    adMfRate: number = 0;

    onLoad() {
        this.heroAttri = cc.find("main/hero_layer/s_hero").getComponent("Hero").attri;
        this.enemyCtrlr = cc.find("main/enemy_layer").getComponent(EnemyCtrlr);
        this.potCtrlr = cc.find("main/pot_layer").getComponent(PotCtrlr);

        // 生成节点池
        this.pool = new MyNodePool((_: MyNodePool): cc.Node => {
            let node = new cc.Node();
            let itemComp = node.addComponent(ItemComp);
            itemComp.itemCtrlr = this;
            return node;
        }, 20, "item", this.node, ItemComp);

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

    _beginItemNode(itemName: new () => any, pos: cc.Vec2, moveX: number, moveY: number) {
        let itemComp: ItemComp = this.pool.getComp();

        let {item, frames, times, magnetic} = this.itemInfos[getClassName(itemName)];
        itemComp.setData(item, frames, times);
        itemComp.watching = magnetic && this.heroAttri.magnetic;

        itemComp.node.position = pos;
        itemComp.move(moveX, moveY);
    }

    // 生成道具 ========================================================

    /**
     * 生成道具
     * @param pos 生成位置
     * @param source 来源
     * @param advanced 高级的可以获取更多更好的道具
     */
    createItem(pos: cc.Vec2, source: ItemSource, advanced: boolean) {
        // 计算有几个道具，分别是什么
        // let itemNames = ["ItemExp1", "ItemExp1", "ItemExp1", "ItemExp1", "ItemHealthPot"];
        let itemNames: (new () => any)[];

        if (advanced) {
            itemNames = this._getItemsFromAdvaced();
        } else if (source == ItemSource.enemy) {
            let count = this.enemyCtrlr.getLivingEnemyCount();
            if (count == 1) {
                itemNames = this._getItemsFromLastEnemy();
            } else {
                itemNames = this._getItemsFromNormal();
            }
        } else {
            let count = this.potCtrlr.getPotRemainsCount();
            if (count == 1) {
                itemNames = this._getItemsFromLastPot();
            } else {
                itemNames = this._getItemsFromNormal();
            }
        }
        itemNames = [ItemHealthPot];
        this.createItemByName(pos, itemNames);
    }

    createItemByName(pos: cc.Vec2, items: (new () => any)[]) {
        let xNum = 0;
        let yNum = 7;
        let xDirIsLeft = true;
        for (const item of items) {
            let x = (xNum + Math.random()) * (xDirIsLeft ? -1 : 1);
            let y = yNum + Math.random();
            this._beginItemNode(item, pos, x, y);

            xNum += 0.2;
            yNum -= 0.2;
            xDirIsLeft = !xDirIsLeft;
        }
    }

    removeItem(itemComp: ItemComp) {
        let node: cc.Node = itemComp.node;
        this.pool.reclaim(node);
    }

    _getItemsFromNormal(): (new () => any)[] {
        let card = this._getCardItem();
        if (card) return card;

        let r = Math.random();
        if (r < 0.1) {
            return this._getEfcItem();
        } else {
            return this._getExpItem();
        }
    }

    _getItemsFromAdvaced(): (new () => any)[] {
        let card = this._getCardItemByAdvanced();
        if (card) return card;

        let r = Math.random();
        if (r < 0.3) {
            return this._getExtraExpItem();
        } else {
            return this._getEfcItem();
        }
    }

    _getItemsFromLastEnemy(): (new () => any)[] {
        let card = this._getCardItem();
        if (card) return card;

        let r = Math.random();
        if (r < 0.1) {
            return this._getExtraExpItem();
        } else {
            return this._getEfcItem();
        }
    }

    _getItemsFromLastPot(): (new () => any)[] {
        let card = this._getCardItem();
        if (card) return card;

        let r = Math.random();
        if (r < 0.6) {
            return this._getHpItem();
        } else {
            return this._getExpItem();
        }
    }

    _getCardItem(): (new () => any)[] {

    }

    _getCardItemByAdvanced(): (new () => any)[] {

    }

    _getEfcItem(): (new () => any)[] {

    }

    _getExpItem(): (new () => any)[] {

    }

    _getExtraExpItem(): (new () => any)[] {

    }

    _getHpItem(): (new () => any)[] {
        return [ItemHealthPot];
    }

    // ========================================================

    clear() {
        this.pool.reclaimOtherFrom(0);
    }
}
