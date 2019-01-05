// GameMemory.ts
// 游戏储存器，负责本地保存数据
// lly 2018.5.12

export class MemoryData {

}

export class GameMemory {

    /** 读取后的回调，new的时候执行读取 */
    loadCall: () => void

    constructor(loadCall: () => void) {
        this.loadCall = loadCall;
        this._load();
    }

    _load() {

    }

    save() {

    }
}
