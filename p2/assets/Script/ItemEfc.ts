// ItemEfc.ts
// 效果道具：
// lly 2018.4.12

import Item from "./Item";

export abstract class ItemEfc extends Item {
    abstract doEffect();
}

export class ItemHealthPot extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemHealthPot_1", time: 1000},
        ];
    }

    doEffect() {
        let attri = cc.find("main/hero_layer/hero").getComponent("Hero").attri;
        attri.hp += attri.hpMax * 0.1;
    }
}