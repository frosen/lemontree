// SMForHero.ts
// 英雄状态：
// 
// lly 2018.1.5

import Hero from "./Hero";

import {CollisionType} from "./TerrainManager";
import {UIDirLvType} from "./HeroUI";

/** 行动状态 */
export enum ActState {
    stand,
    jumpAccelerating, // 跳跃加速期，通过控制器控制加速时间可改变跳跃高度
    jump,
    move,
    dash,
    hurt,
}

export class SMForHero {

    /** 状态列表，enum: SMForHero */
    static stateList: {} = {}
    /** 当前状态 */
    static curState: ActState = null;
    /** 当前状态机 */
    static curStateMachine: SMForHero = null;
    /** 英雄：通过hero类对外界进行影响和控制 */
    static hero: Hero = null;

    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     * @param st: 起始状态
     */
    static init(hero: Hero, st: ActState) {
        SMForHero.hero = hero;

        SMForHero.stateList[ActState.stand] = new SMForHeroInStand();
        SMForHero.stateList[ActState.jumpAccelerating] = new SMForHeroInJumpAccelerating();
        SMForHero.stateList[ActState.jump] = new SMForHeroInJump();
        SMForHero.stateList[ActState.move] = new SMForHeroInMove();
        SMForHero.stateList[ActState.dash] = new SMForHeroInDash();
        SMForHero.stateList[ActState.hurt] = new SMForHeroInHurt();

        // 最开始的状态
        SMForHero._setState(st);
        SMForHero.curStateMachine.begin();
    }

    /** 设置当前状态和状态机 */
    static _setState(st: ActState) {
        SMForHero.curState = st;
        SMForHero.curStateMachine = SMForHero.stateList[st];
    }

    /**
     * 变化到某个状态
     * @param st: 状态
     */
    static changeStateTo(st: ActState): SMForHero {
        let stMachine = SMForHero.stateList[st];

        if (!stMachine.can()) return null;

        SMForHero.curStateMachine.end();

        SMForHero._setState(st);

        SMForHero.curStateMachine.begin();
    }

    /**
     * 通过总状态机调用当前状态机的update；update中完成当前状态对外界的影响
     */
    static machineUpdate(dt: number) {
        SMForHero.curStateMachine.update(dt);
    }
    
    /**
     * 通过总状态机调用当前状态机的check；check主要用于检测是否需要变化
     */
    static machineCheck() {
        SMForHero.curStateMachine.check();
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

class SMForHeroInStand extends SMForHero {
    begin() {
        SMForHero.hero.ui.stand();
        SMForHero.hero.attri.fillJumpAndDashCount();
        SMForHero.hero.movableObj.xVelocity = 0;
    }

    check() {
        if (SMForHero.hero.checkHurt()) {
            SMForHero.changeStateTo(ActState.hurt);

        } else if (SMForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
            SMForHero.changeStateTo(ActState.jump);

        } else if (SMForHero.hero.xMoveDir != 0) {   
            SMForHero.changeStateTo(ActState.move);
        }
    }
}

/** 最大起跳加速时间（秒） */
const MaxJumpAcceTime: number = 0.3;

class SMForHeroInJumpAccelerating extends SMForHero {
    time: number = 0;

    can(): boolean {
        let curSt = SMForHero.curState;

        let canChange: boolean = 
            curSt != ActState.jumpAccelerating &&
            curSt != ActState.dash &&
            curSt != ActState.hurt;

        let hasAbility = SMForHero.hero.attri.jumpCount > 0;
        return canChange && hasAbility;
    }

    begin() {
        SMForHero.hero.ui.jumpUp();
        SMForHero.hero.attri.jumpCount -= 1;
        this.time = 0;
    }

    update(dt: number) {
        this.time += dt;

        let hero = SMForHero.hero;
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.movableObj.yVelocity = hero.attri.ySpeed;
    }

    check() {
        if (SMForHero.hero.checkHurt()) {
            SMForHero.changeStateTo(ActState.hurt);

        } else if (SMForHero.hero.terrainCollision.curYCollisionType != CollisionType.none) {
            SMForHero.changeStateTo(ActState.jump);

        } else if (this.time > MaxJumpAcceTime) {   
            SMForHero.changeStateTo(ActState.jump);
        }
    }
}

class SMForHeroInJump extends SMForHero {
    begin() {
        if (SMForHero.hero.movableObj.getDir().yDir >= 0) {
            SMForHero.hero.ui.jumpUp();
        } else {
            SMForHero.hero.ui.jumpDown();
        }       
    }

    update(dt: number) {
        let hero = SMForHero.hero;

        if (hero.movableObj.getDir().yDir >= 0) {
            hero.ui.jumpUp();
        } else {
            hero.ui.jumpDown();
        } 
   
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
    }

    check() {
        if (SMForHero.hero.checkHurt()) {
            SMForHero.changeStateTo(ActState.hurt);

        } else if (SMForHero.hero.terrainCollision.curYCollisionType != CollisionType.none && 
            SMForHero.hero.movableObj.getDir().yDir <= 0) {
            if (SMForHero.hero.xMoveDir == 0) {
                SMForHero.changeStateTo(ActState.stand);
            } else {
                SMForHero.changeStateTo(ActState.move);
            }
        }
    }
}

class SMForHeroInMove extends SMForHero {
    begin() {
        SMForHero.hero.ui.move();   
        SMForHero.hero.attri.fillJumpAndDashCount();   
    }

    update(dt: number) {
        let hero = SMForHero.hero;  
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
    }

    check() {
        if (SMForHero.hero.checkHurt()) {
            SMForHero.changeStateTo(ActState.hurt);

        } else if (SMForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
            SMForHero.changeStateTo(ActState.jump);
        } else if (SMForHero.hero.xMoveDir == 0) {
            SMForHero.changeStateTo(ActState.stand);
        }
    }
}

/** 冲刺时间（秒） */
const DashTime: number = 0.4;
/** 冲刺速度 像素/帧 */
const DashSpeed: number = 5;

class SMForHeroInDash extends SMForHero {
    time: number = 0;
    dashDir: number = 0;

    can(): boolean {
        let curSt = SMForHero.curState;

        let canChange: boolean = 
            curSt != ActState.dash &&
            curSt != ActState.hurt;

        let hasAbility = SMForHero.hero.attri.dashCount > 0;

        return canChange && hasAbility;
    }

    begin() {
        SMForHero.hero.ui.dash();
        SMForHero.hero.attri.dashCount -= 1;
        this.time = 0;   

        // 在开始时就确定方向，之后不可改变
        this.dashDir = SMForHero.hero.ui.xUIDirs[UIDirLvType.move];

        // 进入不可攻击敌人的状态 todo

        // 暂停y轴的加速度
        SMForHero.hero.movableObj.yVelocity = 0;
        SMForHero.hero.movableObj.yCanAccel = false;
    }

    update(dt: number) {
        this.time += dt;

        SMForHero.hero.movableObj.xVelocity = this.dashDir * DashSpeed;       
    }

    check() {
        if (SMForHero.hero.checkHurt()) {
            SMForHero.changeStateTo(ActState.hurt);

        } else if (this.time > DashTime) {   
            if (SMForHero.hero.terrainCollision.curYCollisionType == CollisionType.none) {
                SMForHero.changeStateTo(ActState.jump);
            } else if (SMForHero.hero.xMoveDir == 0) {
                SMForHero.changeStateTo(ActState.stand);
            } else {
                SMForHero.changeStateTo(ActState.move);
            }
        }
    }

    end() {
        // 退出不可攻击敌人的状态 todo

        // 开启y轴的加速度
        SMForHero.hero.movableObj.yCanAccel = true;
    }
}

const hurtXSpeed: number = 2;
const hurtYSpeed: number = 2;

class SMForHeroInHurt extends SMForHero {
    hurtMoveDir: number = 0;

    begin() {
        let hero = SMForHero.hero;
        let hurtXDir = hero.objCollision.getCollisionXDir();

        hero.ui.hurt(); 
        hero.ui.setXUIDir(hurtXDir, UIDirLvType.hurt);
        
        this.hurtMoveDir = hurtXDir * -1; // 在开始时就确定方向，之后不可改变；方向与ui方向相反
        hero.movableObj.yVelocity = hurtYSpeed;

        // 进入不可攻击敌人的状态 todo
    }

    update(dt: number) {
        SMForHero.hero.movableObj.xVelocity = this.hurtMoveDir * hurtXSpeed;       
    }

    check() {
        if (SMForHero.hero.terrainCollision.curYCollisionType != CollisionType.none &&
            SMForHero.hero.movableObj.getDir().yDir <= 0) {
            if (SMForHero.hero.xMoveDir == 0) {
                SMForHero.changeStateTo(ActState.stand);
            } else {
                SMForHero.changeStateTo(ActState.move);
            }
        }
    }

    end() {
        SMForHero.hero.ui.setXUIDir(0, UIDirLvType.hurt);

        // 退出不可攻击敌人的状态 todo

        // 进入短暂无敌时间
        SMForHero.hero.beginInvincibleState(SMForHero.hero.attri.invincibleTimeForHurt)
    }
}

// ------------------------------------------------------------------------------------------------

// 无敌状态
export enum InvincibleState {
    on,
    off
}

// 无敌状态机
export class InvincibleSM {

    /** 英雄：通过hero类对外界进行影响和控制 */
    static hero: Hero = null;

    /** 当前状态 */
    static state: InvincibleState = InvincibleState.off;

    static time: number = 0;
    static totalTime: number = 0;

    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     */
    static init(hero: Hero) {
        InvincibleSM.hero = hero;
    }

    /**
     * 进入无敌状态
     * @param time: 无敌时间总长
     */
    static begin(time: number) {
        InvincibleSM.state = InvincibleState.on;
        InvincibleSM.time = 0;
        InvincibleSM.totalTime = time;

        InvincibleSM.hero.ui.setInvincibleEnabled(true);
    }

    /**
     * 通过总状态机调用当前状态机的update；update中完成当前状态对外界的影响
     */   
    static machineUpdate(dt: number) {
        if (InvincibleSM.state == InvincibleState.off) return;
        InvincibleSM.time += dt;
        if (InvincibleSM.time > InvincibleSM.totalTime) {
            InvincibleSM.end();
        }
    }

    static end() {
        InvincibleSM.state = InvincibleState.off;
        InvincibleSM.hero.ui.setInvincibleEnabled(false);
    }
}

