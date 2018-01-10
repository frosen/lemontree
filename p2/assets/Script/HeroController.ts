// HeroController.ts
// 英雄控制器：
// 下半部分：左右滑动移动，上滑动跳起，下滑动下跳，快速左右滑动为冲刺
// 上半部分：滑动移动视野
// 此组件放在控制层上，知道Hero类并给其发消息
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import Hero from './Hero';

const DisForMove: number = 20;

@ccclass
export default class HeroController extends cc.Component {

    /** 所控制的英雄 */
    @property(Hero)
    hero: Hero = null;

    /** 控制区域的屏幕比例 */
    moveWRate: number = 0.4;
    moveHRate: number = 0.67;
    jumpXRate: number = 0.6;
    jumpHRate: number = 0.5;

    /** 控制宽度（包括移动和跳跃） */
    moveW: number = 0;
    /** 移动控制高度 */
    moveH: number = 0;
    /** 跳跃控制x起始位置 */
    jumpX: number = 0;
    /** 跳跃控制高度 */
    jumpH: number = 0;

    /** 移动点击的id */
    moveTouchId: number = null;
    /** 移动起始点 */
    moveBeginPos: cc.Vec2 = null;

    /** 移动点击的id */
    watchTouchId: number = null;
    /** 移动起始点 */
    watchBeginPos: cc.Vec2 = null;

    /** 移动点击的id */
    jumpTouchId: number = null;

    onLoad() {
        let size = this.node.getContentSize();

        this.moveW = size.width * this.moveWRate;
        this.moveH = size.height * this.moveHRate;
        this.jumpX = size.width * this.jumpXRate;
        this.jumpH = size.height * this.jumpHRate;

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
        let touchPos: cc.Vec2 = event.getLocation();

        if (touchPos.x <= this.moveW) {
            if (touchPos.y < this.moveH) {
                this.moveTouchId = event.getID();
                this.moveBeginPos = touchPos;
            } else {
                this.watchTouchId = event.getID();
                this.watchBeginPos = touchPos;
            }
            
        } else if (this.jumpX <= touchPos.x) {
            if (touchPos.y < this.jumpH) {
                this.jumpTouchId = event.getID();
                this.hero.jump(true);
            } else {
                this.hero.dash();
            }
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (event.getID() == this.moveTouchId) {
            let x = event.getLocation().x;
            let diff: number = x - this.moveBeginPos.x;
            let dir: number = diff > 0 ? 1 : -1;
            let dis = Math.abs(diff);

            if (dis > DisForMove) {
                this.hero.move(dir);
            }

        } else if (event.getID() == this.watchTouchId) {
            cc.log("watch!");
        } 
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        let id = event.getID();
        if (id == this.moveTouchId) {
            this.moveTouchId = null;
            this.moveBeginPos = null;
            this.hero.move(0);

        } else if (id == this.watchTouchId) {
            this.watchTouchId = null;
            cc.log("watch! end");

        } else if (id == this.jumpTouchId) {
            this.jumpTouchId = null;
            this.hero.jump(false);
        }
    }

    // -------------------------------------------------------------------------------------------------------

    /** 便于测试使用 */
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
                this.hero.jump(true);
                break;
            case cc.KEY.down:
            case cc.KEY.s:
                this.hero.use();
                break;
            case cc.KEY.space:
                this.hero.dash();
                break;
        }
    }

    onKeyUp (event) {
        switch(event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                if (this.hero.xMoveDir < 0) {
                    this.hero.move(0);
                }
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                if (this.hero.xMoveDir > 0) {
                    this.hero.move(0);
                }
                break;
            case cc.KEY.up:
            case cc.KEY.w:
                this.hero.jump(false);
                break;
        }
    }
}
