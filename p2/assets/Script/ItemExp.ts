// ItemExp.ts
// 增加经验（或者是金币什么之类的）：
// lly 2018.4.12

import Item from "./Item";

export class ItemExp extends Item {
    getExp(): number {
        cc.error("need inherit");
        return 0;
    }
}

export class ItemExp1 extends ItemExp {
    getFrameInfos(): {frameName: string, time: number}[] {
        return [
            {frameName: "ItemExp1_1", time: 1000},
            {frameName: "ItemExp1_2", time: 300},
            {frameName: "ItemExp1_3", time: 300},
        ];
    }
    
    getExp(): number {
        return 1;
    }
}