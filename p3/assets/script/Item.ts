// Item.ts
// 道具：道具的核心，记录某个道具的功能
// lly 2018.4.12

import ItemComp from "./ItemComp";

export default abstract class Item {
    abstract getFrameInfos(): {frameName: string, time: number}[];
}