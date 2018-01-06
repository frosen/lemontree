// StateForHero.ts
// 英雄状态：
// 
// lly 2018.1.5

const {ccclass, property} = cc._decorator;

export enum ActState {
    stand,
    move,
    jumpUp,
    jumpDown,
}

export enum Dir {
    right = 1,
    left = -1,
}

@ccclass
export class StateForHero {

    actState: ActState = ActState.stand;

    dir: Dir = Dir.right;

    onLoad() {
        // init logic
        
    }

    setActState(st: ActState) {

    }
    getActState(): ActState {
        return this.actState;
    }

    setDir(d: Dir) {

    }
    getDir(): Dir {
        return this.dir;
    }
}
