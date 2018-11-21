// ItemEfc.ts
// 效果道具：
// lly 2018.4.12

import Item from "./Item";
import AttriForHero from "./AttriForHero";

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