// GameMemory.ts
// 游戏储存器，负责本地保存数据
// lly 2018.5.12

export class MemoryData {
    curScene: number;
}

export class GameMemory {

    /** 读取后的回调，new的时候执行读取 */
    loadCall: () => void

    loadedData: MemoryData = null;

    constructor(loadCall: () => void) {
        this.loadCall = loadCall;
    }

    load() {
        this.loadedData = new MemoryData();
        this.loadedData.curScene = 0;
        this.loadCall();
    }

    save() {

    }
}
