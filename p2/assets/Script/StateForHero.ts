// StateForHero.ts
// 英雄状态：
// 
// lly 2018.1.5

import Hero from "./Hero";

import {CollisionType} from "./TerrainManager";
import {UIDirLvType} from "./HeroUI";

export enum ActState {
    stand,
    jumpAccelerating, // 跳跃加速期，通过控制器控制加速时间可改变跳跃高度
    jump,
    move,
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
        StateForHero.stateList[ActState.jumpAccelerating] = new StateForHeroInJumpAccelerating();
        StateForHero.stateList[ActState.jump] = new StateForHeroInJump();
        StateForHero.stateList[ActState.move] = new StateForHeroInMove();
        StateForHero.stateList[ActState.dash] = new StateForHeroInDash();
        StateForHero.stateList[ActState.hurt] = new StateForHeroInHurt();

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

class StateForHeroInStand extends StateForHero {
    begin() {
        StateForHero.hero.ui.stand();
        StateForHero.hero.attri.fillJumpAndDashCount();
        StateForHero.hero.movableObj.xVelocity = 0;
    }

    check() {
        // 先检测是否受伤 todo

        if (StateForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
            StateForHero.changeStateTo(ActState.jump);
        } else if (StateForHero.hero.xMoveDir != 0) {   
            StateForHero.changeStateTo(ActState.move);
        }
    }
}

/** 最大起跳加速时间（秒） */
const MaxJumpAcceTime: number = 0.3;

class StateForHeroInJumpAccelerating extends StateForHero {
    time: number = 0;

    can(): boolean {
        let curSt = StateForHero.curState;

        let canChange: boolean = 
            curSt != ActState.jumpAccelerating &&
            curSt != ActState.dash &&
            curSt != ActState.hurt;

        let hasAbility = StateForHero.hero.attri.jumpCount > 0;
        return canChange && hasAbility;
    }

    begin() {
        StateForHero.hero.ui.jumpUp();
        StateForHero.hero.attri.jumpCount -= 1;
        this.time = 0;
    }

    update(dt: number) {
        this.time += dt;

        let hero = StateForHero.hero;
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
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

class StateForHeroInJump extends StateForHero {
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
   
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
    }

    check() {
        // 先检测是否受伤 todo
        
        if (StateForHero.hero.terrainCollision.curYCollisionType != CollisionType.none && 
            StateForHero.hero.movableObj.getDir().yDir <= 0) {
            if (StateForHero.hero.xMoveDir == 0) {
                StateForHero.changeStateTo(ActState.stand);
            } else {
                StateForHero.changeStateTo(ActState.move);
            }
        }
    }
}

class StateForHeroInMove extends StateForHero {
    begin() {
        StateForHero.hero.ui.move();   
        StateForHero.hero.attri.fillJumpAndDashCount();   
    }

    update(dt: number) {
        let hero = StateForHero.hero;  
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
    }

    check() {
        // 先检测是否受伤 todo

        if (StateForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
            StateForHero.changeStateTo(ActState.jump);
        } else if (StateForHero.hero.xMoveDir == 0) {
            StateForHero.changeStateTo(ActState.stand);
        }
    }
}

/** 冲刺时间（秒） */
const DashTime: number = 0.4;
/** 冲刺速度 像素/帧 */
const DashSpeed: number = 5;

class StateForHeroInDash extends StateForHero {
    time: number = 0;
    dashDir: number = 0;

    can(): boolean {
        let curSt = StateForHero.curState;

        let canChange: boolean = 
            curSt != ActState.dash &&
            curSt != ActState.hurt;

        let hasAbility = StateForHero.hero.attri.dashCount > 0;

        return canChange && hasAbility;
    }

    begin() {
        StateForHero.hero.ui.dash();
        StateForHero.hero.attri.dashCount -= 1;
        this.time = 0;   

        // 在开始时就确定方向，之后不可改变
        this.dashDir = StateForHero.hero.ui.xUIDirs[UIDirLvType.move];

        // 进入不可攻击敌人的状态 todo

        // 暂停y轴的加速度
        StateForHero.hero.movableObj.yVelocity = 0;
        StateForHero.hero.movableObj.yCanAccel = false;
    }

    update(dt: number) {
        this.time += dt;

        StateForHero.hero.movableObj.xVelocity = this.dashDir * DashSpeed;       
    }

    check() {
        // 先检测是否受伤 todo

        if (this.time > DashTime) {   
            if (StateForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
                StateForHero.changeStateTo(ActState.jump);
            } else if (StateForHero.hero.xMoveDir == 0) {
                StateForHero.changeStateTo(ActState.stand);
            } else {
                StateForHero.changeStateTo(ActState.move);
            }
        }
    }

    end() {
        // 退出不可攻击敌人的状态 todo

        // 开启y轴的加速度
        StateForHero.hero.movableObj.yCanAccel = true;
    }
}

const hurtXSpeed: number = 1;
const hurtYSpeed: number = 1;

class StateForHeroInHurt extends StateForHero {
    hurtDir: number = 0;

    begin() {
        StateForHero.hero.ui.hurt(); 

        // 在开始时就确定方向，之后不可改变；方向与ui方向相反
        this.hurtDir = StateForHero.hero.ui.xUIDirs[UIDirLvType.hurt] * -1;

        StateForHero.hero.movableObj.yVelocity = hurtYSpeed;

        // 进入不可攻击敌人的状态 todo
    }

    update(dt: number) {
        StateForHero.hero.movableObj.xVelocity = this.hurtDir * hurtXSpeed;       
    }

    check() {
        if (StateForHero.hero.terrainCollision.curYCollisionType != CollisionType.none &&
            StateForHero.hero.movableObj.getDir().yDir <= 0) {
            if (StateForHero.hero.xMoveDir == 0) {
                StateForHero.changeStateTo(ActState.stand);
            } else {
                StateForHero.changeStateTo(ActState.move);
            }
        }
    }

    end() {
        // 退出不可攻击敌人的状态 todo

        // 进入短暂无敌时间 todo
    }
}