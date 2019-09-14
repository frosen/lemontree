// SMForHero.ts
// 英雄状态：
//
// lly 2018.1.5

import { Hero } from './Hero';

import { CollisionType, ForcedMoveType } from './TerrainCtrlr';
import { HeroDirLv } from './HeroLooks';
import Attack from './Attack';
import FigureDisplay from './FigureDisplay';
import { SMMgr, SM } from './SMBase';
import Spine from './Spine';

/** 行动状态 */
export enum ActState {
    stand = SMMgr.createSMState(),
    jumpAccelerating = SMMgr.createSMState(),
    jump = SMMgr.createSMState(),
    move = SMMgr.createSMState(),
    dash = SMMgr.createSMState(),
    hurt = SMMgr.createSMState(),
    dead = SMMgr.createSMState(),
    jumpByWall = SMMgr.createSMState(),
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

        this.stateList[ActState.jumpByWall] = new SMForHeroInJumpByWall();
    }
}

class SMForHero extends SM<Hero> {}

class SMForHeroInStand extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        mgr.smObj.looks.stand();
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
        mgr.smObj.looks.endStand();
    }
}

/** 最大起跳加速时间（秒） */
const MaxJumpAcceTime: number = 0.3;

class SMForHeroInJumpAccelerating extends SMForHero {
    time: number = 0;

    can(mgr: SMForHeroMgr): boolean {
        let curSt = mgr.curState;

        if (curSt == ActState.dash) {
            if (mgr.smObj.attri.jumpingByWall > 0 && mgr.smObj.terrainCollider.edgeType == CollisionType.entity) {
                //撞墙跳
                mgr.changeStateTo(ActState.jumpByWall);
            }
            return false;
        } else if (curSt == ActState.hurt) {
            // 如果有快速恢复的能力，并且有额外的跳跃次数，则恢复硬直
            if (mgr.smObj.attri.fastHitRecovery > 0 && mgr.smObj.attri.jumpCount.get() > 0) {
                mgr.smObj.looks.showHitRecovery();
                return true;
            } else {
                return false;
            }
        } else {
            let canChange: boolean = curSt != ActState.jumpAccelerating;
            let hasAbility = mgr.smObj.attri.jumpCount.get() > 0;

            // 本身速度比跳跃时产生的速度还快时，就不能执行跳跃
            let limit = mgr.smObj.movableObj.yVelocity < mgr.smObj.attri.ySpeed.get();

            return canChange && hasAbility && limit;
        }
    }

    begin(mgr: SMForHeroMgr) {
        let hero: Hero = mgr.smObj;
        hero.looks.jumpUp();
        hero.attri.jumpCount.add(-1);
        if (hero.terrainCollider.curYCollisionType == CollisionType.none) {
            mgr.smObj.looks.showJumpingAirFlow();
        }
        this.time = 0;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        this.time += dt;

        let hero = mgr.smObj;
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed.get();
        hero.looks.setXUIDir(hero.xMoveDir, HeroDirLv.move);
        hero.movableObj.yVelocity = hero.attri.ySpeed.get();
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
        mgr.smObj.looks.endJumpUp();
    }
}

class SMForHeroInJump extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        if (mgr.smObj.movableObj.getDir().yDir >= 0) {
            mgr.smObj.looks.jumpUp();
        } else {
            mgr.smObj.looks.jumpDown();
        }
    }

    update(dt: number, mgr: SMForHeroMgr) {
        let hero = mgr.smObj;

        if (hero.movableObj.getDir().yDir >= 0) {
            hero.looks.jumpUp();
        } else {
            hero.looks.jumpDown();
        }

        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed.get();
        hero.looks.setXUIDir(hero.xMoveDir, HeroDirLv.move);
    }

    check(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;

        if (hero.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);
        } else if (
            hero.terrainCollider.curYCollisionType != CollisionType.none &&
            hero.movableObj.getDir().yDir <= 0 &&
            hero.movableObj.yLastVelocity <= 0
        ) {
            if (hero.xMoveDir == 0) {
                mgr.changeStateTo(ActState.stand);
            } else {
                mgr.changeStateTo(ActState.move);
            }
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.looks.endJumpDown();
    }
}

class SMForHeroInMove extends SMForHero {
    begin(mgr: SMForHeroMgr) {
        let hero: Hero = mgr.smObj;
        hero.looks.move();
        hero.attri.fillJumpAndDashCount();
    }

    update(dt: number, mgr: SMForHeroMgr) {
        let hero = mgr.smObj;
        hero.movableObj.xVelocity = hero.xMoveDir * hero.attri.xSpeed.get();
        hero.looks.setXUIDir(hero.xMoveDir, HeroDirLv.move);
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
        mgr.smObj.looks.endMove();
    }
}

/** 冲刺时间（秒） */
const DashTime: number = 0.4;
/** 冲刺速度 像素/帧 */
const DashSpeed: number = 6;

class SMForHeroInDash extends SMForHero {
    time: number = 0;
    dashDir: number = 0;

    can(mgr: SMForHeroMgr): boolean {
        let curSt = mgr.curState;

        let canChange: boolean = curSt != ActState.dash && curSt != ActState.hurt;

        let hasAbility = mgr.smObj.attri.dashCount.get() > 0;

        return canChange && hasAbility;
    }

    begin(mgr: SMForHeroMgr) {
        let hero: Hero = mgr.smObj;
        hero.looks.dash();
        hero.attri.dashCount.add(-1);
        this.time = 0;

        // 在开始时就确定方向，之后不可改变
        this.dashDir = hero.looks.xUIDirs[HeroDirLv.move];

        // 进入不可攻击敌人的状态
        hero.setNoAtkStateEnabled(true);

        // 重置方向
        hero.looks.setXUIDir(this.dashDir, HeroDirLv.move);

        // 暂停y轴的速度
        hero.movableObj.yVelocityEnabled = false;
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
        mgr.smObj.looks.endDash();

        // 退出不可攻击敌人的状态
        mgr.smObj.setNoAtkStateEnabled(false);

        // 开启y轴的速度
        mgr.smObj.movableObj.yVelocityEnabled = true;
    }
}

const hurtXSpeed: number = 2;
const hurtYSpeed: number = 2;
const evadeInvcTime: number = 0.4;

class SMForHeroInHurt extends SMForHero {
    hurtMoveDir: number = 0;

    figureDisplay: FigureDisplay;

    constructor() {
        super();
        this.figureDisplay = cc.find('main/figure_layer').getComponent(FigureDisplay);
        cc.assert(this.figureDisplay, 'need figure display');
    }

    can(mgr: SMForHeroMgr): boolean {
        let hero = mgr.smObj;

        let atk = hero.getHurtAtk();
        if (!atk.magicAttack) {
            let r = Math.random(); // 计算闪躲
            if (mgr.curState == ActState.dash ? r < hero.attri.evade.get() : r < hero.attri.dashEvade.get()) {
                // 显示闪躲
                let node = hero.node;
                let xCenter = node.x + node.width * (0.5 - node.anchorX);
                let yCenter = node.y + node.height * (0.5 - node.anchorY);
                this.figureDisplay.showEvade(cc.v2(xCenter, yCenter));
                hero.beginInvcState(evadeInvcTime); // 小无敌
                return false;
            }
        }

        if (hero.attri.trapDefence > 0 && atk.attri.getComponent(Spine)) {
            let death = this._calcHurt(mgr);
            if (!death) hero.beginInvcState(hero.attri.invcTimeForHurt.get() + 0.5);
            return false;
        }

        return true;
    }

    begin(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;

        let death = this._calcHurt(mgr);
        if (death) return;

        hero.looks.hurt();
        hero.setNoAtkStateEnabled(true); // 进入不可攻击敌人的状态
        this._hurtMove(hero);
    }

    _calcHurt(mgr: SMForHeroMgr): boolean {
        let hero = mgr.smObj;

        // 受伤属性计算
        let atk: Attack = hero.getHurtAtk();
        let { dmg, crit } = atk.getDamage();
        if (hero.attri.defence) {
            dmg -= dmg * 0.05 * hero.attri.defence;
        }
        let death = atk.handleHp(hero.attri, dmg);

        atk.executeHitCallback(hero.node, death, dmg, crit);

        // 死亡
        if (death) {
            mgr.changeStateTo(ActState.dead);
            return true;
        }

        // 减损状态
        if (atk.debuff) hero.debuff.setDebuff(atk.debuff);

        // 显示数字
        let node = hero.node;
        let xCenter = node.x + node.width * (0.5 - node.anchorX);
        let yCenter = node.y + node.height * (0.5 - node.anchorY);
        let pos = cc.v2(xCenter, yCenter);
        let hurtDir = hero.getHurtDir();
        this.figureDisplay.showFigure(pos, hurtDir, dmg, crit, atk.getAttackColor());

        return false;
    }

    _hurtMove(hero: Hero) {
        let hurtXDir = hero.getHurtDir();
        hero.looks.setXUIDir(hurtXDir, HeroDirLv.hurt);

        this.hurtMoveDir = hurtXDir * -1; // 在开始时就确定方向，之后不可改变；方向与ui方向相反
        hero.movableObj.yVelocity = hurtYSpeed;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        mgr.smObj.movableObj.xVelocity = this.hurtMoveDir * hurtXSpeed;
    }

    check(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;
        let yDir: number = hero.movableObj.getDir().yDir;
        let lastYVelocity: number = hero.movableObj.yLastVelocity;

        if (hero.terrainCollider.curYCollisionType != CollisionType.none && yDir <= 0 && lastYVelocity <= 0) {
            this._onToGround(mgr);
        } else if (hero.terrainCollider.forcedMoveType == ForcedMoveType.flow) {
            this._onToFlow(mgr);
        }
    }

    _onToGround(mgr: SMForHeroMgr) {
        let hero = mgr.smObj;
        if (hero.xMoveDir == 0) {
            mgr.changeStateTo(ActState.stand);
        } else {
            mgr.changeStateTo(ActState.move);
        }
    }

    _onToFlow(mgr: SMForHeroMgr) {
        mgr.changeStateTo(ActState.jump);
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.looks.endHurt();
        mgr.smObj.looks.setXUIDir(0, HeroDirLv.hurt);

        // 退出不可攻击敌人的状态
        mgr.smObj.setNoAtkStateEnabled(false);

        // 进入短暂无敌时间
        mgr.smObj.beginInvcState(mgr.smObj.attri.invcTimeForHurt.get());
    }
}

class SMForHeroInDead extends SMForHeroInHurt {
    begin(mgr: SMForHeroMgr) {
        cc.log('you dead');

        let hero = mgr.smObj;

        // 死亡击飞效果和受伤类似
        hero.looks.dead();
        this._hurtMove(hero);

        // 进入死亡模式
        hero.onDead();
    }

    _onToGround(mgr: SMForHeroMgr) {
        this.hurtMoveDir = 0;
    }

    _onToFlow(mgr: SMForHeroMgr) {}
}

// ------------------------------------------------------------------------------------------------
const MaxJumpByWallTime: number = 0.3;
class SMForHeroInJumpByWall extends SMForHero {
    time: number = 0;
    bounceDir: number = 0; //反弹方向

    begin(mgr: SMForHeroMgr) {
        let hero: Hero = mgr.smObj;
        hero.looks.jumpUp();
        hero.looks.showJumpingByWallAirFlow();
        this.time = 0;

        this.bounceDir = hero.looks.xUIDirs[HeroDirLv.move] * -1;
    }

    update(dt: number, mgr: SMForHeroMgr) {
        this.time += dt;

        let hero = mgr.smObj;
        mgr.smObj.movableObj.xVelocity = this.bounceDir * DashSpeed;
        hero.looks.setXUIDir(this.bounceDir, HeroDirLv.move);
        hero.movableObj.yVelocity = hero.attri.ySpeed.get();
    }

    check(mgr: SMForHeroMgr) {
        if (mgr.smObj.checkHurt()) {
            mgr.changeStateTo(ActState.hurt);
        } else if (mgr.smObj.terrainCollider.curYCollisionType != CollisionType.none) {
            mgr.changeStateTo(ActState.jump);
        } else if (this.time > MaxJumpByWallTime) {
            mgr.changeStateTo(ActState.jump);
        }
    }

    end(mgr: SMForHeroMgr) {
        mgr.smObj.looks.endJumpUp();
    }
}

// ------------------------------------------------------------------------------------------------

// 无敌状态
export enum InvcState {
    off,
    on,
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

        this.hero.looks.setInvincibleEnabled(true);
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
        this.hero.looks.setInvincibleEnabled(false);
    }
}
