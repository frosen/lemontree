// ItemEfc.ts
// 效果道具：
// lly 2018.4.12

import Item from "./Item";
import AttriForHero from "./AttriForHero";
import {MapCtrlr, SceneAttri} from "./MapCtrlr";

export abstract class ItemEfc extends Item {
    abstract doEffect();
    isMagnetic(): boolean {return false};
}

export class ItemHealthPot extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemHealthPot_1", time: 1000},
        ];
    }

    /** 恢复已损失血量的20% */
    doEffect() {
        let attri: AttriForHero = cc.find("main/hero_layer/s_hero").getComponent("Hero").attri;
        let hpLoss = attri.maxHp.get() - attri.hp.get();
        attri.hp.add(hpLoss * 0.2);
    }
}

export class ItemCardPot extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemCard_1", time: 1000},
        ];
    }

    /** 根据当前场景和拥有卡片的程度，随机获取一张卡片 */
    doEffect() {
        let mapCtrlr: MapCtrlr = cc.find("main/map").getComponent("MapCtrlr");
        let sceneAttri: SceneAttri = mapCtrlr.getCurSceneAttri();
        let sceneCards: number[] = sceneAttri.cardIndexs;

        let attri: AttriForHero = cc.find("main/hero_layer/s_hero").getComponent("Hero").attri;
        let noObtCards = attri.getNoObtainedCards();

        // 获取两个list中的相同项，两个list都是递增的
        let sceneCardIndex = 0;
        let noObtCardIndex = 0;
        let availableCards: number[] = [];
        while (sceneCardIndex < sceneCards.length && noObtCardIndex < noObtCards.length) {
            let sceneCard = sceneCards[sceneCardIndex];
            let noObtCard = noObtCards[noObtCardIndex];
            if (sceneCard == noObtCard) {
                availableCards.push(sceneCard);
            } else if (sceneCard > noObtCard) {
                noObtCardIndex++;
            } else {
                sceneCardIndex++;
            }
        }

        let cardIndex = availableCards[Math.floor(Math.random() * availableCards.length)];
        attri.addCard(cardIndex);

        // UI表现后reset
        attri.reset();
    }
}