// SMForHero.ts
// 英雄状态：
// 
// lly 2018.1.5

import Hero from "./Hero";

import {CollisionType} from "./TerrainCtrlr";
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

export class SMForHeroMgr {

    /** 状态列表，enum: SMForHero */
    stateList: {} = {}
    /** 当前状态 */
    curState: ActState = null;
    /** 当前状态机 */
    curStateMachine: SMForHero = null;
    /** 英雄：通过hero类对外界进行影响和控制 */
    hero: Hero = null;

    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     * @param st: 起始状态
     */
    constructor(hero: Hero, st: ActState) {
        this.hero = hero;

        this.stateList[ActState.stand] = new SMForHeroInStand();
        this.stateList[ActState.jumpAccelerating] = new SMForHeroInJumpAccelerating();
        this.stateList[ActState.jump] = new SMForHeroInJump();
        this.stateList[ActState.move] = new SMForHeroInMove();
        this.stateList[ActState.dash] = new SMForHeroInDash();
        this.stateList[ActState.hurt] = new SMForHeroInHurt();

        // 最开始的状态
        this._setState(st);
        this.curStateMachine.begin(this);
    }

    /** 设置当前状态和状态机 */
    _setState(st: ActState) {
        this.curState = st;
        this.curStateMachine = this.stateList[st];
    }

    /**
     * 变化到某个状态
     * @param st: 状态
     */
    changeStateTo(st: ActState): SMForHero {
        let stMachine = this.stateList[st];

        if (!stMachine.can(this)) return null;

        this.curStateMachine.end(this);

        this._setState(st);

        this.curStateMachine.begin(this);
    }

    /**
     * 通过总状态机调用当前状态机的update；update中完成当前状态对外界的影响
     */
    machineUpdate(dt: number) {
        this.curStateMachine.update(dt, this);
    }
    
    /**
     * 通过总状态机调用当前状态机的check；check主要用于检测是否需要变化
     */
    machineCheck() {
        this.curStateMachine.check(this);
    }   
}

class SMForHero {
    can(mgr: SMForHeroMgr): boolean {
        return true;
    }

    begin(mgr: SMForHeroMgr) {}
    update(dt: number, mgr: SMForHeroMgr) {}
    check(mgr: SMForHeroMgr) {}
    end(mgr: SMForHeroMgr) {}
}

class SMForHeroInStand extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        mgr.hero.ui.stand();
        mgr.hero.attri.fillJumpAndDashCount();
        mgr.hero.movableObj.xVelocity = 0;
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.hero.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (mgr.hero.terrainCollider.curYCollisionType == CollisionType.none) {
            mgr.changeStateTo(ActState.jump);

        } else if (mgr.hero.xMoveDir != 0) {   
            mgr.changeStateTo(ActState.move);
        }
    }
}

/** 最大起跳加速时间（秒） */
const MaxJumpAcceTime: number = 0.3;

class SMForHeroInJumpAccelerating extends SMForHero {
    time: number = 0;

    can(mgr: SMForHeroMgr): boolean {
        let curSt = mgr.curState;

        let canChange: boolean = 
            curSt != ActState.jumpAccelerating &&
            curSt != ActState.dash &&
            curSt != ActState.hurt;
        let hasAbility = mgr.hero.attri.jumpCount > 0;
        return canChange && hasAbility;
    }

    begin(mgr: SMForHeroMgr) {
        mgr.hero.ui.jumpUp();
        mgr.hero.attri.jumpCount -= 1;
        this.time = 0;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        this.time += dt;

        let hero = mgr.hero;
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.ui.setXUIDir(hero.xMoveDir, UIDirLvType.move);
        hero.movableObj.yVelocity = hero.attri.ySpeed;
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.hero.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (mgr.hero.terrainCollider.curYCollisionType != CollisionType.none) {
            mgr.changeStateTo(ActState.jump);

        } else if (this.time > MaxJumpAcceTime) {   
            mgr.changeStateTo(ActState.jump);
        }
    }
}

class SMForHeroInJump extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        if (mgr.hero.movableObj.getDir().yDir >= 0) {
            mgr.hero.ui.jumpUp();
        } else {
            mgr.hero.ui.jumpDown();
        }       
    }

    update(dt: number, mgr: SMForHeroMgr) {
        let hero = mgr.hero;

        if (hero.movableObj.getDir().yDir >= 0) {
            hero.ui.jumpUp();
        } else {
            hero.ui.jumpDown();
        } 
   
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.ui.setXUIDir(hero.xMoveDir, UIDirLvType.move);
    }

    check(mgr: SMForHeroMgr) {
        let hero = mgr.hero;

        if (hero.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (hero.terrainCollider.curYCollisionType != CollisionType.none && 
            hero.movableObj.getDir().yDir <= 0 && hero.movableObj.yLastVelocity <= 0) {
            if (hero.xMoveDir == 0) {
                mgr.changeStateTo(ActState.stand);
            } else {
                mgr.changeStateTo(ActState.move);
            }
        }
    }
}

class SMForHeroInMove extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        mgr.hero.ui.move();   
        mgr.hero.attri.fillJumpAndDashCount();   
    }

    update(dt: number, mgr: SMForHeroMgr) {
        let hero = mgr.hero;  
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.ui.setXUIDir(hero.xMoveDir, UIDirLvType.move);
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.hero.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (mgr.hero.terrainCollider.curYCollisionType == CollisionType.none) {
            mgr.changeStateTo(ActState.jump);
        } else if (mgr.hero.xMoveDir == 0) {
            mgr.changeStateTo(ActState.stand);
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

    can(mgr: SMForHeroMgr): boolean {
        let curSt = mgr.curState;

        let canChange: boolean = 
            curSt != ActState.dash &&
            curSt != ActState.hurt;

        let hasAbility = mgr.hero.attri.dashCount > 0;

        return canChange && hasAbility;
    }

    begin(mgr: SMForHeroMgr) {
        mgr.hero.ui.dash();
        mgr.hero.attri.dashCount -= 1;
        this.time = 0;   

        // 在开始时就确定方向，之后不可改变
        this.dashDir = mgr.hero.xMoveDir;
        mgr.hero.ui.setXUIDir(this.dashDir, UIDirLvType.move);

        // 进入不可攻击敌人的状态 todo

        // 暂停y轴的加速度
        mgr.hero.movableObj.yVelocity = 0;
        mgr.hero.movableObj.yAccelEnabled = false;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        this.time += dt;

        mgr.hero.movableObj.xVelocity = this.dashDir * DashSpeed;       
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.hero.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (this.time > DashTime) {   
            if (mgr.hero.terrainCollider.curYCollisionType == CollisionType.none) {
                mgr.changeStateTo(ActState.jump);
            } else if (mgr.hero.xMoveDir == 0) {
                mgr.changeStateTo(ActState.stand);
            } else {
                mgr.changeStateTo(ActState.move);
            }
        }
    }

    end(mgr: SMForHeroMgr) {
        // 退出不可攻击敌人的状态 todo

        // 开启y轴的加速度
        mgr.hero.movableObj.yAccelEnabled = true;
    }
}

const hurtXSpeed: number = 2;
const hurtYSpeed: number = 2;

class SMForHeroInHurt extends SMForHero {
    hurtMoveDir: number = 0;

    begin(mgr: SMForHeroMgr) {
        let hero = mgr.hero;
        let hurtXDir = hero.getHurtDir();

        hero.ui.hurt(); 
        hero.ui.setXUIDir(hurtXDir, UIDirLvType.hurt);
        
        this.hurtMoveDir = hurtXDir * -1; // 在开始时就确定方向，之后不可改变；方向与ui方向相反
        hero.movableObj.yVelocity = hurtYSpeed;

        // 进入不可攻击敌人的状态 todo
    }

    update(dt: number, mgr: SMForHeroMgr) {
        mgr.hero.movableObj.xVelocity = this.hurtMoveDir * hurtXSpeed;       
    }

    check(mgr: SMForHeroMgr) {
        let hero = mgr.hero;
        let yDir: number = hero.movableObj.getDir().yDir;
        let lastYVelocity: number = hero.movableObj.yLastVelocity;
        if (hero.terrainCollider.curYCollisionType != CollisionType.none &&
            yDir <= 0 && lastYVelocity <= 0) {
            if (hero.xMoveDir == 0) {
                mgr.changeStateTo(ActState.stand);
            } else {
                mgr.changeStateTo(ActState.move);
            }
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.hero.ui.setXUIDir(0, UIDirLvType.hurt);
        mgr.hero.ui.endHurt();

        // 退出不可攻击敌人的状态 todo

        // 进入短暂无敌时间
        mgr.hero.beginInvcState(mgr.hero.attri.invcTimeForHurt)
    }
}

// ------------------------------------------------------------------------------------------------

// 无敌状态
export enum InvcState {
    on,
    off
}

// 无敌状态机
export class SMForHeroInvcMgr {

    /** 英雄：通过hero类对外界进行影响和控制 */
    hero: Hero = null;

    /** 当前状态 */
    state: InvcState = InvcState.off;

    time: number = 0;
    totalTime: number = 0;

    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     */
    constructor(hero: Hero) {
        this.hero = hero;
    }

    /**
     * 进入无敌状态
     * @param time: 无敌时间总长
     */
    begin(time: number) {
        this.state = InvcState.on;
        this.time = 0;
        this.totalTime = time;

        this.hero.ui.setInvincibleEnabled(true);
    }

    /**
     * 通过总状态机调用当前状态机的update；update中完成当前状态对外界的影响
     */   
    machineUpdate(dt: number) {
        if (this.state == InvcState.off) return;
        this.time += dt;
        if (this.time > this.totalTime) {
            this.end();
        }
    }

    end() {
        this.state = InvcState.off;
        this.hero.ui.setInvincibleEnabled(false);
    }
}

