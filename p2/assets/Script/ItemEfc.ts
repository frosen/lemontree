// ItemEfc.ts
// 效果道具：
// lly 2018.4.12

import Item from "./Item";
import ItemCtrlr from "./ItemCtrlr";

export abstract class ItemEfc extends Item {
    abstract doEffect();

    getCtrlr(): ItemCtrlr {
        return cc.find("main/item_layer").getComponent(ItemCtrlr);
    }
}

export class ItemHealthPot extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemHealthPot_1", time: 1000},
        ];
    }

    doEffect() {
        let attri = this.getCtrlr().hero.attri;
        attri.hp += attri.hpMax * 0.1;
    }
}