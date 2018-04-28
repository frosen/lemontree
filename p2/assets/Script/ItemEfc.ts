// ItemEfc.ts
// 效果道具：
// lly 2018.4.12

import Item from "./Item";

export abstract class ItemEfc extends Item {

}

export class ItemHealthPot extends ItemEfc {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemHealthPot_1", time: 1000},
        ];
    }
}