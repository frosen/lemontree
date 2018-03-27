// SMForHero.ts
// 英雄状态：
// 
// lly 2018.1.5

import Hero from "./Hero";

import {CollisionType} from "./TerrainCtrlr";
import {UIDirLvType} from "./HeroUI";
import Attack from "./Attack";
import FigureDisplay from "./FigureDisplay";
import {SMMgr, SM} from "./SMBase";

/** 行动状态 */
export class ActState {
    static stand: number = SMMgr.createSMState();
    static jumpAccelerating: number = SMMgr.createSMState();
    static jump: number = SMMgr.createSMState();
    static move: number = SMMgr.createSMState();
    static dash: number = SMMgr.createSMState();
    static hurt: number = SMMgr.createSMState();
    static dead: number = SMMgr.createSMState();
}



export class SMForHeroMgr extends SMMgr<Hero> {
    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     */
    constructor(hero: Hero) {
        super(hero);
        this.stateList[ActState.stand] = new SMForHeroInStand();
        this.stateList[ActState.jumpAccelerating] = new SMForHeroInJumpAccelerating();
        this.stateList[ActState.jump] = new SMForHeroInJump();
        this.stateList[ActState.move] = new SMForHeroInMove();
        this.stateList[ActState.dash] = new SMForHeroInDash();
        this.stateList[ActState.hurt] = new SMForHeroInHurt();
        this.stateList[ActState.dead] = new SMForHeroInDead();      
    }
}

class SMForHero extends SM<Hero> {
    
}

class SMForHeroInStand extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        mgr.smObj.ui.stand();
        mgr.smObj.attri.fillJumpAndDashCount();
        mgr.smObj.movableObj.xVelocity = 0;
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.smObj.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (mgr.smObj.terrainCollider.curYCollisionType == CollisionType.none) {
            mgr.changeStateTo(ActState.jump);

        } else if (mgr.smObj.xMoveDir != 0) {   
            mgr.changeStateTo(ActState.move);
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.ui.endStand();
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
        let hasAbility = mgr.smObj.attri.jumpCount > 0;
        return canChange && hasAbility;
    }

    begin(mgr: SMForHeroMgr) {
        mgr.smObj.ui.jumpUp();
        mgr.smObj.attri.jumpCount -= 1;
        this.time = 0;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        this.time += dt;

        let hero = mgr.smObj;
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.ui.setXUIDir(hero.xMoveDir, UIDirLvType.move);
        hero.movableObj.yVelocity = hero.attri.ySpeed;
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.smObj.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (mgr.smObj.terrainCollider.curYCollisionType != CollisionType.none) {
            mgr.changeStateTo(ActState.jump);

        } else if (this.time > MaxJumpAcceTime) {   
            mgr.changeStateTo(ActState.jump);
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.ui.endJumpUp();
    }
}

class SMForHeroInJump extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        if (mgr.smObj.movableObj.getDir().yDir >= 0) {
            mgr.smObj.ui.jumpUp();
        } else {
            mgr.smObj.ui.jumpDown();
        }       
    }

    update(dt: number, mgr: SMForHeroMgr) {
        let hero = mgr.smObj;

        if (hero.movableObj.getDir().yDir >= 0) {
            hero.ui.jumpUp();
        } else {
            hero.ui.jumpDown();
        } 
   
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.ui.setXUIDir(hero.xMoveDir, UIDirLvType.move);
    }

    check(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;

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

    end(mgr: SMForHeroMgr) {
        mgr.smObj.ui.endJumpDown();
    }
}

class SMForHeroInMove extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        mgr.smObj.ui.move();   
        mgr.smObj.attri.fillJumpAndDashCount();   
    }

    update(dt: number, mgr: SMForHeroMgr) {
        let hero = mgr.smObj;  
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed;
        hero.ui.setXUIDir(hero.xMoveDir, UIDirLvType.move);
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.smObj.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (mgr.smObj.terrainCollider.curYCollisionType == CollisionType.none) {
            mgr.changeStateTo(ActState.jump);
        } else if (mgr.smObj.xMoveDir == 0) {
            mgr.changeStateTo(ActState.stand);
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.ui.endMove();
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

        let hasAbility = mgr.smObj.attri.dashCount > 0;

        return canChange && hasAbility;
    }

    begin(mgr: SMForHeroMgr) {
        mgr.smObj.ui.dash();
        mgr.smObj.attri.dashCount -= 1;
        this.time = 0;   

        // 在开始时就确定方向，之后不可改变
        this.dashDir = mgr.smObj.ui.xUIDirs[UIDirLvType.move];

        // 进入不可攻击敌人的状态
        mgr.smObj.setNoAtkStateEnabled(true);

        // 重置方向
        mgr.smObj.ui.setXUIDir(this.dashDir, UIDirLvType.move);

        // 暂停y轴的加速度
        mgr.smObj.movableObj.yVelocity = 0;
        mgr.smObj.movableObj.yAccelEnabled = false;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        this.time += dt;
        mgr.smObj.movableObj.xVelocity = this.dashDir * DashSpeed;       
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.smObj.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);

        } else if (this.time > DashTime) {   
            if (mgr.smObj.terrainCollider.curYCollisionType == CollisionType.none) {
                mgr.changeStateTo(ActState.jump);
            } else if (mgr.smObj.xMoveDir == 0) {
                mgr.changeStateTo(ActState.stand);
            } else {
                mgr.changeStateTo(ActState.move);
            }
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.ui.endDash();

        // 退出不可攻击敌人的状态
        mgr.smObj.setNoAtkStateEnabled(false);

        // 开启y轴的加速度
        mgr.smObj.movableObj.yAccelEnabled = true;
    }
}

const hurtXSpeed: number = 2;
const hurtYSpeed: number = 2;
const evadeInvcTime: number = 0.4;

class SMForHeroInHurt extends SMForHero {
    hurtMoveDir: number = 0;

    figureDisplay: FigureDisplay = null;

    constructor() {
        super();
        this.figureDisplay = cc.find("main/figure_layer").getComponent(FigureDisplay);
        myAssert(this.figureDisplay, "need figure display");
    }

    can(mgr: SMForHeroMgr): boolean {
        // 计算闪躲
        let r = Math.random();
        if (r < mgr.smObj.attri.evade) {
            // 显示闪躲 llytodo
            let node = mgr.smObj.node;  
            let xCenter = node.x + node.width * (0.5 - node.anchorX);
            let yCenter = node.y + node.height * (0.5 - node.anchorY);
            this.figureDisplay.showEvade(cc.v2(xCenter, yCenter));
            mgr.smObj.beginInvcState(evadeInvcTime); // 小无敌
            return false;
        } else {
            return true;
        }
    }

    begin(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;

        // 受伤属性计算
        let atk: Attack = hero.getHurtAtk();
        let {dmg, crit} = atk.getDamage();

        hero.attri.hp -= dmg;

        atk.excuteHitCallback(hero.node);
        
        // 死亡
        if (hero.attri.hp <= 0) { 
            mgr.changeStateTo(ActState.dead);
            return;
        }

        let hurtXDir = hero.getHurtDir();

        hero.ui.hurt(); 
        hero.setNoAtkStateEnabled(true); // 进入不可攻击敌人的状态
        hero.ui.setXUIDir(hurtXDir, UIDirLvType.hurt);
        
        this.hurtMoveDir = hurtXDir * -1; // 在开始时就确定方向，之后不可改变；方向与ui方向相反
        hero.movableObj.yVelocity = hurtYSpeed;

        // 显示数字   
        let node = hero.node;  
        let xCenter = node.x + node.width * (0.5 - node.anchorX);
        let yCenter = node.y + node.height * (0.5 - node.anchorY);
        this.figureDisplay.showFigure(cc.v2(xCenter, yCenter), dmg, crit, atk.magicAttack);

        // 更改ui显示 llytodo
    }

    update(dt: number, mgr: SMForHeroMgr) {
        mgr.smObj.movableObj.xVelocity = this.hurtMoveDir * hurtXSpeed;       
    }

    check(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;
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
        mgr.smObj.ui.endHurt();
        mgr.smObj.ui.setXUIDir(0, UIDirLvType.hurt);

        // 退出不可攻击敌人的状态
        mgr.smObj.setNoAtkStateEnabled(false);

        // 进入短暂无敌时间
        mgr.smObj.beginInvcState(mgr.smObj.attri.invcTimeForHurt);
    }
}

class SMForHeroInDead extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        cc.log("you dead");
    }

    update(dt: number, mgr: SMForHeroMgr) {
        cc.log("dead!");
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

