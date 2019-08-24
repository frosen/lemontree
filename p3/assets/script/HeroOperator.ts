// HeroOperator.ts
// 英雄控制器：
// 下半部分：左右滑动移动，上滑动跳起，下滑动下跳，快速左右滑动为冲刺
// 上半部分：滑动移动视野
// 此组件放在控制层上，知道Hero类并给其发消息
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import {Hero} from "./Hero";
import CameraCtrlr from "./CameraCtrlr";

const DisForMove: number = 7;
const MinMoveBegin: number = 30;

const CameraBackC: number = 0.8;
const CameraBackP: number = 1;

@ccclass
export default class HeroOperator extends MyComponent {

    /** 所控制的英雄 */
    @property(Hero)
    hero: Hero = null;

    /** 控制镜头位置的偏移 */
    @property(CameraCtrlr)
    camera: CameraCtrlr = null;

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
    /** 移动方向 */
    moveDir: number = 0;

    /** 镜头移动点击的id */
    watchTouchId: number = null;
    /** 镜头移动起始点 */
    watchBeginPos: cc.Vec2 = null;
    /** 镜头移动的偏移量 */
    watchOffset: cc.Vec2 = cc.v2(0, 0);

    /** 开启镜头返回 */
    cameraBack: boolean = false;
    /** 镜头返回移动方向 */
    cameraBackDir: cc.Vec2 = cc.v2(0, 0);

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
                this.moveBeginPos = cc.v2(Math.max(touchPos.x, MinMoveBegin), Math.max(touchPos.y, MinMoveBegin));

                // 点击到边缘直接移动
                if (touchPos.x < this.moveBeginPos.x - DisForMove) {
                    this.moveDir = -1;
                    this.hero.move(this.moveDir);
                }
            } else {
                if (!this.cameraBack) {
                    this.watchTouchId = event.getID();
                    this.watchBeginPos = touchPos;
                }
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
            if (this.moveDir == 0) {
                if (diff > DisForMove) {
                    this.moveDir = 1;
                } else if (diff < -DisForMove) {
                    this.moveDir = -1;
                }
            } else if (this.moveDir > 0) {
                if (diff < -DisForMove) {
                    this.moveDir = -1;
                }
            } else {
                if (diff > DisForMove) {
                    this.moveDir = 1;
                }
            }
            this.hero.move(this.moveDir);

        } else if (event.getID() == this.watchTouchId) {
            let {x, y} = event.getLocation();
            x -= this.watchBeginPos.x;
            y -= this.watchBeginPos.y;
            x = Math.min(x, 100);
            y = Math.min(y, 75);
            this.watchOffset.x = x * 2;
            this.watchOffset.y = y * 2;
            this.camera.offset = this.watchOffset;
        }
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        let id = event.getID();
        if (id == this.moveTouchId) {
            this.moveTouchId = null;
            this.moveBeginPos = null;
            this.moveDir = 0;
            this.hero.move(this.moveDir);

        } else if (id == this.watchTouchId) {
            this.watchTouchId = null;
            if (this.watchOffset.x != 0 || this.watchOffset.y != 0) {
                this.cameraBack = true;
                this.cameraBackDir.x = this.watchOffset.x < 0 ? 1 : -1;
                this.cameraBackDir.y = this.watchOffset.y < 0 ? 1 : -1;
            }

        } else if (id == this.jumpTouchId) {
            this.jumpTouchId = null;
            this.hero.jump(false);
        }
    }

    update(_: number) {
        if (!this.cameraBack) return;

        let right = this.cameraBackDir.x == 1;
        let up = this.cameraBackDir.y == 1;

        this.watchOffset.x = this.watchOffset.x * CameraBackC + (CameraBackP * (right ? 1 : -1));
        this.watchOffset.y = this.watchOffset.y * CameraBackC + (CameraBackP * (up ? 1 : -1));

        this.watchOffset.x = right ? Math.min(this.watchOffset.x, 0) : Math.max(this.watchOffset.x, 0);
        this.watchOffset.y = up ? Math.min(this.watchOffset.y, 0) : Math.max(this.watchOffset.y, 0);

        this.camera.offset = this.watchOffset;
        if (this.watchOffset.x == 0 && this.watchOffset.y == 0) this.cameraBack = false;
    }

    // -------------------------------------------------------------------------------------------------------

    /** 便于测试使用 */
    initKeyboardEvents() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event) {
        if (!this.enabled) return;
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

            case cc.KEY.f: // 瞬间平移
                let dir = this.hero.looks.xUIDir;
                this.hero.movableObj.blink(this.hero.node.x + dir * 300, this.hero.node.y);
                break;

            case cc.KEY.t:
                cc.find("main").getComponent("GameCtrlr").test1();
                break;
            case cc.KEY.y:
                cc.find("main").getComponent("GameCtrlr").test2();
                break;
            case cc.KEY.u:
                cc.find("main").getComponent("GameCtrlr").test3();
                break;
            case cc.KEY.i:
                cc.find("main").getComponent("GameCtrlr").test4();
                break;
        }
    }

    onKeyUp (event) {
        if (!this.enabled) return;
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
