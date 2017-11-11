// TouchCtrler.ts
// 触摸板控制器
// lly 2017.11.11

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

@ccclass
export default class TouchCtrler extends cc.Component {

    onLoad() {
        // init logic
        this.initTouchEvents();
    }

    initTouchEvents() {
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_START, this.onTouched, this);
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_MOVE, this.onTouched, this);

        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouched(event: cc.Event.EventTouch) {
        let nodePos: cc.Vec2 = this.node.convertToNodeSpace(event.getLocation());
        
        let xRate: number = nodePos.x / this.node.width;
        let yRate: number = nodePos.y / this.node.height;

        cc.systemEvent.emit(MyName(MyEvent.move), {
            xRate: xRate,
            yRate: yRate
        });
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        cc.systemEvent.emit(MyName(MyEvent.endMove));
    }
}
