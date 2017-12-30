// HeroController.ts
// 英雄控制器：
// 下半部分：左右滑动移动，上滑动跳起，下滑动下跳，快速左右滑动为冲刺
// 上半部分：滑动移动视野
// 此组件放在控制层上，知道Hero类并给其发消息
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import Hero from './Hero';

const DisForMove: number = 20;
const DisForModifyX: number = 50;
const DisForDash: number = 60;

const SpeedForDash: number = 30;
const SpeedEndDash: number = 10;

const SpeedForJump: number = 20;
const SpeedEndJump: number = -1;

const SpeedForUse: number = -20;
const SpeedEndUse: number = 1;

const MarginForDash: number = 20;
const MoveXPerFrame: number = 0.1;

@ccclass
export default class HeroController extends cc.Component {

    /** 所控制的英雄 */
    @property(Hero)
    hero: Hero = null;

    /** 控制影响的点击的id */
    heroTouchId: number = null;
    /** 控制起始点 */
    heroBeginPos: cc.Vec2 = null;

    onLoad() {
        this.initTouchEvents();
        this.initKeyboardEvents();
    }

    initTouchEvents() {
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        let nodePos: cc.Vec2 = event.getLocation();
        if (nodePos.y <= this.node.height * 0.5) {
            this.heroTouchId = event.getID();
            this.onHeroActionStart(nodePos);
        } else {
            this.onScopeMoveStart(nodePos);
        }
    }

    onHeroActionStart(pos: cc.Vec2) {
        this.heroBeginPos = pos;
    }

    onScopeMoveStart(pos: cc.Vec2) {

    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (event.getID() == this.heroTouchId) {
            this.onHeroActionMove(event);
        }       
    }
    
    touchPosX: number = -1;
    isDashing: boolean = false;
    isJumping: boolean = false;
    isUsing: boolean = false;
    onHeroActionMove(event: cc.Event.EventTouch) {
        let pos: cc.Vec2 = event.getLocation();
        let lastPos: cc.Vec2 = event.getPreviousLocation();

        // 检测是否需要移动中心X
        this.touchPosX = pos.x;

        // 检测移动和冲刺
        let diff: number = pos.x - this.heroBeginPos.x;
        let dir: number = diff > 0 ? 1 : -1;
        let dis = Math.abs(diff);
        let speed = Math.abs(lastPos.x - pos.x);

        if (speed > SpeedForDash) this.isDashing = true;
        else if (speed < SpeedEndDash) this.isDashing = false;

        if (dis > DisForDash && this.isDashing) {
            this.isDashing = false;
            this.hero.dash(dir); 
        } else if (dis > DisForMove) {
            this.hero.move(dir);
        } else {
            this.hero.move(0);
        }
        
        // 检测跳跃，跳跃停止，下滑
        let ySpeed = pos.y - lastPos.y;
        if (ySpeed > SpeedForJump && !this.isJumping) {
            this.isJumping = true;
            this.hero.jump();
        } else if (ySpeed < SpeedEndJump) {
            this.isJumping = false;
        }

        if (ySpeed < SpeedForUse && !this.isUsing) {
            this.isUsing = true;
            this.hero.use();
        } else if (ySpeed > SpeedEndUse) {
            this.isUsing = false;
        }

        // 记录Y轴位置
        this.heroBeginPos.y = pos.y;
    }

    onScopeMove(pos: cc.Vec2) {

    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.heroBeginPos = null;
        this.heroTouchId = null;

        this.touchPosX = -1;
        this.isDashing = false;
        this.isJumping = false;
        this.isUsing = false;

        this.hero.move(0);
    }

    // -------------------------------------------------------------------------------------------------------

    moveXPrepauseFrames: number = 0;
    update() {
        if (this.heroBeginPos && this.touchPosX > 0) {
            let dis = this.touchPosX - this.heroBeginPos.x;
            if (Math.abs(dis) > DisForModifyX) {
                this.moveXPrepauseFrames++;
                let frame = this.moveXPrepauseFrames - 30;
                if (frame > 0) {
                    if (dis > 0) {
                        if (this.heroBeginPos.x < this.node.width - DisForDash - MarginForDash) {
                            this.heroBeginPos.x += MoveXPerFrame * frame;
                        }
                    } else {
                        if (DisForDash + MarginForDash < this.heroBeginPos.x) {
                            this.heroBeginPos.x -= MoveXPerFrame * frame;
                        }
                    }
                }
            } else {
                this.moveXPrepauseFrames = 0;
            }
        } else {
            this.moveXPrepauseFrames = 0;
        }
    }

    // -------------------------------------------------------------------------------------------------------

    getBeginPosOrNull(): cc.Vec2 {
        return this.heroBeginPos;
    }

    // -------------------------------------------------------------------------------------------------------

    // 便于测试使用
    initKeyboardEvents() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                this.hero.move(-1);
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this.hero.move(1);
                break;
            case cc.KEY.up:
            case cc.KEY.w:
                this.hero.jump();
                break;
        }
    }

    onKeyUp (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
            case cc.KEY.d:
            case cc.KEY.right:
                this.hero.move(0);
                break;
        }
    }
}
