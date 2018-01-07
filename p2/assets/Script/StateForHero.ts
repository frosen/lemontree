// StateForHero.ts
// 英雄状态：
// 
// lly 2018.1.5

import Hero from "./Hero";

import {CollisionType} from "./TerrainManager";

export enum ActState {
    stand,
    move,
    jumpAccelerating,
    jump,
    dash,
    hurt,
}

export class StateForHero {

    /** 状态列表，enum: StateForHero */
    static stateList: {} = {}
    /** 当前状态 */
    static curState: ActState = null;
    /** 当前状态机 */
    static curStateMachine: StateForHero = null;
    /** 英雄：通过hero类对外界进行影响和控制 */
    static hero: Hero = null;

    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     * @param st: 起始状态
     */
    static init(hero: Hero, st: ActState) {
        StateForHero.hero = hero;

        StateForHero.stateList[ActState.stand] = new StateForHeroInStand();

        // 最开始的状态
        StateForHero._setState(st);
        StateForHero.curStateMachine.begin();
    }

    /** 设置当前状态和状态机 */
    static _setState(st: ActState) {
        StateForHero.curState = st;
        StateForHero.curStateMachine = StateForHero.stateList[st];
    }

    /**
     * 变化到某个状态
     * @param st: 状态
     */
    static changeStateTo(st: ActState): StateForHero {
        let stMachine = StateForHero.stateList[st];

        if (!stMachine.can()) return null;

        StateForHero.curStateMachine.end();

        StateForHero._setState(st);

        StateForHero.curStateMachine.begin();
    }

    /**
     * 通过总状态机调用当前状态机的update；update中完成当前状态对外界的影响
     */
    static machineUpdate(dt: number) {
        StateForHero.curStateMachine.update(dt);
    }
    
    /**
     * 通过总状态机调用当前状态机的check；check主要用于检测是否需要变化
     */
    static machineCheck() {
        StateForHero.curStateMachine.check();
    }

    // --------------------------------------------------------

    can(): boolean {
        return true;
    }

    begin() {}
    update(dt: number) {}
    check() {}
    end() {}
}

class StateForHeroInStand {
    begin() {
        StateForHero.hero.ui.stand();
        StateForHero.hero.attri.fillJumpCount();
        StateForHero.hero.movableObj.xVelocity = 0;
    }

    check() {
        // 先检测是否受伤 todo

        if (StateForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
            StateForHero.changeStateTo(ActState.jump);
        } else if (StateForHero.hero.xDir != 0) {   
            StateForHero.changeStateTo(ActState.move);
        }
    }
}

/** 最大起跳加速时间（秒） */
const MaxJumpAcceTime: number = 1;

class StateForHeroInJumpAccelerating {
    time: number = 0;

    can(): boolean {
        let curSt = StateForHero.curState;

        let canChange: boolean = 
            curSt != ActState.jumpAccelerating &&
            curSt != ActState.dash &&
            curSt != ActState.hurt;

        let hasCapacity = StateForHero.hero.attri.jumpCount > 0;

        return canChange && hasCapacity;
    }

    begin() {
        StateForHero.hero.ui.jumpUp();
        StateForHero.hero.attri.jumpCount -= 1;
        this.time = 0;
    }

    update(dt: number) {
        this.time += dt;

        let hero = StateForHero.hero;
        hero.movableObj.xVelocity = hero.xDir * hero.attri.xSpeed;
        hero.movableObj.yVelocity = hero.attri.ySpeed;
    }

    check() {
        // 先检测是否受伤 todo

        if (StateForHero.hero.terrainCollision.curYCollisionType != CollisionType.none) {
            StateForHero.changeStateTo(ActState.jump);
        } else if (this.time > MaxJumpAcceTime) {   
            StateForHero.changeStateTo(ActState.jump);
        }
    }
}

class StateForHeroInJump {
    begin() {
        if (StateForHero.hero.movableObj.getDir().yDir >= 0) {
            StateForHero.hero.ui.jumpUp();
        } else {
            StateForHero.hero.ui.jumpDown();
        }       
    }

    update(dt: number) {
        let hero = StateForHero.hero;

        if (hero.movableObj.getDir().yDir >= 0) {
            hero.ui.jumpUp();
        } else {
            hero.ui.jumpDown();
        } 
   
        hero.movableObj.xVelocity = hero.xDir * hero.attri.xSpeed;
    }

    check() {
        // 先检测是否受伤 todo

        if (StateForHero.hero.terrainCollision.curYCollisionType != CollisionType.none && 
            StateForHero.hero.movableObj.getDir().yDir < 0) {
            if (StateForHero.hero.xDir == 0) {
                StateForHero.changeStateTo(ActState.stand);
            } else {
                StateForHero.changeStateTo(ActState.move);
            }
        }
    }
}
