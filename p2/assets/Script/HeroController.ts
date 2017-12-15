// HeroController.ts
// 英雄控制器：
// 下半部分：左右滑动移动，上滑动跳起，下滑动下跳，快速左右滑动为冲刺
// 上半部分：滑动移动视野
// 此组件放在控制层上，知道Hero类并给其发消息
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import Hero from './Hero';

const disForMove: number = 20;
const disForModifyX: number = 50;
const disForDash: number = 60;

const speedForDash: number = 30;
const speedEndDash: number = 10;

const speedForJump: number = 20;
const speedEndJump: number = -1;

const speedForUse: number = -20;
const speedEndUse: number = 1;

const marginForDash: number = 20;
const moveXPerFrame: number = 0.1;

@ccclass
export default class HeroController extends cc.Component {

    @property(Hero)
    hero: Hero = null;

    // 英雄控制
    heroTouchId: number = -9999;
    heroBeginPos: cc.Vec2 = null;

    onLoad() {
        this.initTouchEvents();
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
        let dir: number = diff > 0 ? 1 : 0;
        let dis = Math.abs(diff);
        let speed = Math.abs(lastPos.x - pos.x);

        if (speed > speedForDash) this.isDashing = true;
        else if (speed < speedEndDash) this.isDashing = false;

        if (dis > disForDash && this.isDashing) {
            this.isDashing = false;
            this.hero.dash(dir); 
        } else if (dis > disForMove) {
            this.hero.move(dir);
        } else {
            this.hero.move(0);
        }
        
        // 检测跳跃，跳跃停止，下滑
        let ySpeed = pos.y - lastPos.y;
        if (ySpeed > speedForJump && !this.isJumping) {
            this.isJumping = true;
            this.hero.jump();
        } else if (ySpeed < speedEndJump) {
            this.isJumping = false;
        }

        if (ySpeed < speedForUse && !this.isUsing) {
            this.isUsing = true;
            this.hero.use();
        } else if (ySpeed > speedEndUse) {
            this.isUsing = false;
        }

        // 记录Y轴位置
        this.heroBeginPos.y = pos.y;
    }

    onScopeMove(pos: cc.Vec2) {

    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.heroBeginPos = null;
        this.heroTouchId = -9999;

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
            if (Math.abs(dis) > disForModifyX) {
                this.moveXPrepauseFrames++;
                let frame = this.moveXPrepauseFrames - 30;
                if (frame > 0) {
                    if (dis > 0) {
                        if (this.heroBeginPos.x < this.node.width - disForDash - marginForDash) {
                            this.heroBeginPos.x += 0.1 * frame;
                        }
                    } else {
                        if (disForDash + marginForDash < this.heroBeginPos.x) {
                            this.heroBeginPos.x -= moveXPerFrame * frame;
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
}
