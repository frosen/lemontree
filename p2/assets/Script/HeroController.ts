// HeroController.ts
// 英雄控制器：
// 下半部分：左右滑动移动，上滑动跳起，下滑动下跳，快速左右滑动为冲刺
// 上半部分：滑动移动视野
// 此组件放在控制层上，知道Hero类并给其发消息
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

const disForMove: number = 30;
const disForDash: number = 80;

@ccclass
export default class HeroController extends cc.Component {

    // 英雄控制
    heroTouchId: number = -9999;
    heroBeginX: number = -9999;

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
        let nodePos: cc.Vec2 = this.node.convertToNodeSpace(event.getLocation());
        if (nodePos.y <= this.node.height * 0.5) {
            this.heroTouchId = event.getID();
            this.onHeroActionStart(nodePos);
        } else {
            this.onScopeMoveStart(nodePos);
        }
    }

    onHeroActionStart(pos: cc.Vec2) {
        this.heroBeginX = pos.x;
    }

    onScopeMoveStart(pos: cc.Vec2) {

    }

    onTouchMove(event: cc.Event.EventTouch) {
        if (event.getID() == this.heroTouchId) {
            this.onHeroActionMove(event);
        }       
    }
    
    onHeroActionMove(event: cc.Event.EventTouch) {
        let pos: cc.Vec2 = this.node.convertToNodeSpace(event.getLocation());

        // 检测移动和冲刺
        let diff: number = pos.x - this.heroBeginX;
        let isRight: boolean = diff > 0;
        let dis = Math.abs(diff);
        cc.log(pos.x, this.heroBeginX, diff, isRight);
        if (dis > disForDash) {
            let lastPos = this.node.convertToNodeSpace(event.getPreviousLocation());
            cc.log("FAST to " + (isRight ? "right" : "left"), Math.abs(lastPos.x - pos.x));            
        } else if (dis > disForMove) {
            cc.log("move to " + (isRight ? "right" : "left"));
        }

        // 检测是否需要移动中心X

        // 检测跳跃，跳跃停止，下滑
    }

    onScopeMove(pos: cc.Vec2) {

    }

    onTouchEnd(event: cc.Event.EventTouch) {
        // cc.systemEvent.emit(MyName(MyEvent.endMove));
    }
}
