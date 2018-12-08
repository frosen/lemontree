// ItemEfc.ts
// 效果道具：
// lly 2018.4.12

import Item from "./Item";
import AttriForHero from "./AttriForHero";
import {MapCtrlr, SceneAttri} from "./MapCtrlr";
import {Hero} from "./Hero";

export abstract class ItemEfc extends Item {
    isMagnetic(): boolean {return false};
}

// 特殊道具 获取后的UI显示和普通不一样========================================================

/** 恢复已损失血量的20% */
class ItemHealthPot extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemHealthPot_1", time: 1000},
        ];
    }

    doEffect() {
        let attri: AttriForHero = cc.find("main/hero_layer/s_hero").getComponent("AttriForHero");
        let hpLoss = attri.maxHp.get() - attri.hp.get();
        attri.hp.add(hpLoss * 0.2);
    }
}

/** 根据当前场景和拥有卡片的程度，随机获取一张卡片 */
/** 注意：卡片效果只能在下一次使用 */
class ItemCard extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemCard_1", time: 1000},
        ];
    }

    doEffect() {
        let hero: Hero = cc.find("main/hero_layer/s_hero").getComponent("Hero");
        let attri: AttriForHero = hero.attri;
        let noObtCards = attri.getNoObtainedCards();

        // 已经获得全部卡片，特殊UI
        if (noObtCards.length == 0) {
            // UI表现 llytodo
            return;
        }

        let mapCtrlr: MapCtrlr = cc.find("main/map").getComponent("MapCtrlr");
        let sceneAttri: SceneAttri = mapCtrlr.getCurSceneAttri();
        let sceneCards: number[] = sceneAttri.cardIndexs;

        // 获取两个list中的相同项，两个list都是递增的
        let sceneCardIndex = 0;
        let noObtCardIndex = 0;
        let availableCards: number[] = [];
        while (sceneCardIndex < sceneCards.length && noObtCardIndex < noObtCards.length) {
            let sceneCard = sceneCards[sceneCardIndex];
            let noObtCard = noObtCards[noObtCardIndex];
            if (sceneCard == noObtCard) {
                availableCards.push(sceneCard);
                sceneCardIndex++;
                noObtCardIndex++;
            } else if (sceneCard > noObtCard) {
                noObtCardIndex++;
            } else {
                sceneCardIndex++;
            }
        }

        // 如果本地图可以允许获得的所有卡片都已经获得，则可以获得其他卡片
        if (availableCards.length == 0) {
            availableCards = noObtCards;
        }

        let cardIndex = availableCards[Math.floor(Math.random() * availableCards.length)];
        attri.addCard(cardIndex);

        // UI表现
    }
}

// 普通道具 ========================================================

/** 和卡片一样的效果的道具的基类 */
abstract class ItemNormalEffectBase extends ItemEfc {

    doEffect() {
        this._doEffect();

        // UI显示效果
        // lly todo
    }

    abstract _doEffect();
}

/** 和卡片一样的效果的道具的基类 */
abstract class ItemCardEffectBase extends ItemNormalEffectBase {

    _doEffect() {
        let hero: Hero = cc.find("main/hero_layer/s_hero").getComponent("Hero");
        let attri: AttriForHero = hero.attri;
        let name = this._getCardName();
        let index = attri.cardNames.indexOf(name);
        let max = attri.getCardMax(index);
        let card: number = attri[name];
        if (card < max) {
            attri[name] = card + 1;
            if (max == 3) { // 有三级的是主动能力卡片
                hero.resetCardAbility();
            }
        }
    }

    abstract _getCardName(): string;
}

class ItemCardSwordWave extends ItemCardEffectBase {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemSword_1", time: 1000},
        ];
    }

    _getCardName(): string {
        return "swordWave";
    }
}

class ItemCardFlameSprite extends ItemCardEffectBase {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemFlame_1", time: 1000},
        ];
    }

    _getCardName(): string {
        return "flameSprite";
    }
}

class ItemCriticalSword extends ItemNormalEffectBase {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemSword_1", time: 1000},
        ];
    }

    _doEffect() {
        let attri: AttriForHero = cc.find("main/hero_layer/s_hero").getComponent("AttriForHero");
        attri.critRate.add(0.2);
    }
}

export const ItemEfcDict = {
    ItemHealthPot: ItemHealthPot,
    ItemCard: ItemCard,
    ItemCardSwordWave: ItemCardSwordWave,
    ItemCardFlameSprite: ItemCardFlameSprite,
    ItemCriticalSword: ItemCriticalSword
}