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

import {ItemExp, ItemExp1} from "./ItemExp";
import {ItemEfc, ItemEfcDict} from "./ItemEfc";

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

    /** 会按照从高到低的顺序排列经验掉落，便于遍历查找合适的 */
    expList: ItemExp[] = [];
    /** 经验基数 */
    expBase: number = 0;
    /** 经验最小值 */
    expMin: ItemExp = null;
    /** 经验池 */
    expPool: number = 0;

    /** 物品掉落概率 */
    curMfRate: number = 0;
    /** 物品掉落概率池 */
    mfRatePool: number = 0;
    /** 高级物品掉落概率 */
    curAdMfRate: number = 0;
    /** 高级物品掉落概率池 */
    adMfRatePool: number = 0;

    efcList: ItemEfc[] = [];

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

        // 加载所有经验掉落 （按照经验从高到低的顺序）
        this._pushExpItemIntoInfo(ItemExp1);

        // 加载所有的道具
        this._pushExtraEfcItemIntoInfo(ItemEfcDict.ItemHealthPot);
        this._pushExtraEfcItemIntoInfo(ItemEfcDict.ItemCard);

        this._pushEfcItemIntoInfo(ItemEfcDict.ItemCardSwordWave);
        this._pushEfcItemIntoInfo(ItemEfcDict.ItemCardFlameSprite);

        this._pushEfcItemIntoInfo(ItemEfcDict.ItemCriticalSword);



        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir("items", cc.SpriteFrame, (error: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }
            this._onGotFrames(frames);
        });

        // test llytodo
        this.expBase = 20;
        for (const expItem of this.expList) {
            if (expItem.getExp() <= this.expBase) {
                this.expMin = expItem;
                break;
            }
        }
        this.curMfRate = 0.03;
        this.curAdMfRate = 0.11;
    }

    _pushExpItemIntoInfo(itemType: {new()}) {
        let item: ItemExp = new itemType();
        this.itemInfos[getClassName(itemType)] = new ItemInfo(item);
        this.expList.push(item);
    }

    _pushExtraEfcItemIntoInfo(itemType: {new()}) {
        let item: ItemEfc = new itemType();
        this.itemInfos[getClassName(itemType)] = new ItemInfo(item);
    }

    _pushEfcItemIntoInfo(itemType: {new()}) {
        let item: ItemEfc = new itemType();
        this.itemInfos[getClassName(itemType)] = new ItemInfo(item);
        this.efcList.push(item);
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
        itemComp.watching = magnetic && this.heroAttri.magnetic > 0;

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
        let items: (new () => any)[];
        if (advanced) {
            items = this._getItemsFromAdvaced();
        } else if (source == ItemSource.enemy) {
            let count = this.enemyCtrlr.getLivingEnemyCount();
            if (count == 1) {
                items = this._getItemsFromLastEnemy();
            } else {
                items = this._getItemsFromNormal();
            }
        } else {
            let count = this.potCtrlr.getPotRemainsCount();
            if (count == 1) {
                items = this._getItemsFromLastPot();
            } else {
                items = this._getItemsFromNormal();
            }
        }

        if (items) this.createItemByName(pos, items);
    }

    /** 创造item，设置飞出的位置和速度 */
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
        if (r < 0.05) {
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
        if (r < 0.1) {
            return this._getExtraExpItem();
        } else if (r < 0.1) {
            return this._getExpItem();
        } else {
            return this._getHpItem();
        }
    }

    _getCardItem(): (new () => any)[] {
        let r = Math.random();
        if (r < this.mfRatePool) {
            this.mfRatePool = 0;
            return [ItemEfcDict.ItemCard];
        } else {
            this.mfRatePool += this.curMfRate;
        }
    }

    _getCardItemByAdvanced(): (new () => any)[] {
        let r = Math.random();
        if (r < this.adMfRatePool) {
            this.adMfRatePool = 0;
            return [ItemEfcDict.ItemCard];
        } else {
            this.adMfRatePool += this.curAdMfRate;
        }
    }

    _getEfcItem(): (new () => any)[] {
        let len = this.efcList.length;
        let index = Math.floor(Math.random() * len);
        let item: ItemEfc = this.efcList[index];
        return [item.constructor as (new () => any)];
    }

    _getExpItem(): (new () => any)[] {
        if (this.expPool < 1) { // 50%留 50%放基数
            if (Math.random() < 0.5) {
                this.expPool += this.expBase;
                return null;
            } else {
                this.expPool += this.expBase - this.expMin.getExp();
                return [this.expMin.constructor as (new () => any)];
            }
        } else if (this.expPool < this.expMin.getExp() * 7) { // 20%留 50%放基数 15%全放 15%加倍全放
            let r = Math.random();
            if (r < 0.2) {
                this.expPool += this.expBase;
                return null;
            } else if (r < 0.7) {
                this.expPool += this.expBase - this.expMin.getExp();
                return [this.expMin.constructor as (new () => any)];
            } else if (r < 0.85) {
                let exp = this.expPool;
                this.expPool -= exp;
                return this._createExpItems(exp);
            } else {
                let exp = this.expPool * 2;
                this.expPool -= exp;
                return this._createExpItems(exp);
            }
        } else {
            if (Math.random() < 0.5) {
                let exp = this.expPool;
                this.expPool -= exp;
                return this._createExpItems(exp);
            } else {
                let exp = this.expPool * 2;
                this.expPool -= exp;
                return this._createExpItems(exp);
            }
        }
    }

    _getExtraExpItem(): (new () => any)[] {
        let exp = this.expBase * (6 + Math.floor(Math.random() * 3));
        let expItems = this._createExpItems(exp);

        let minExpCount = (4 + Math.floor(Math.random() * 3));
        for (let _ = 0; _ < minExpCount; _++) {
            expItems.push(this.expMin.constructor as (new () => any));
        }
        return expItems;
    }

    _createExpItems(exp: number): (new () => any)[] {
        let expItems: (new () => any)[] = [];
        for (let index = 0; index < this.expList.length;) {
            const expItem = this.expList[index];
            if (exp >= expItem.getExp()) {
                expItems.push(expItem.constructor as (new () => any));
                exp -= expItem.getExp();
            } else {
                index++;
            }
        }
        return expItems;
    }

    _getHpItem(): (new () => any)[] {
        return [ItemEfcDict.ItemHealthPot];
    }

    // ========================================================

    clear() {
        this.pool.reclaimOtherFrom(0);
    }
}
