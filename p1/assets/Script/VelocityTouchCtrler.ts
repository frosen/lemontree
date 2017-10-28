// VelocityTouchCtrler.ts
// 通过触屏控制速度的变化
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName, Velocity} from './ConstValue'

enum TouchState {
    begin,
    end,
}

@ccclass
export default class VelocityTouchCtrler extends cc.Component {

    state: TouchState = TouchState.end;

    beginHeight: number = 130;

    leftWidth: number = 300;
    midWidth: number = 300;

    leftVelocity: Velocity = Velocity.fast;
    midVelocity: Velocity = Velocity.mid;
    rightVelocity: Velocity = Velocity.slow;

    onLoad() {
        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_START, function (event) {
            let xOrignal = event.getLocationX();
            let yOrignal = event.getLocationY();

            if (yOrignal < this.beginHeight) {
                this.state = TouchState.begin;
                this.handleTouchPosition(xOrignal);
            }          
        }, this);

        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (this.state != TouchState.begin) return;
            let x = event.getLocationX();
            this.handleTouchPosition(x);
        }, this);

        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.state != TouchState.begin) return;
            this.state = TouchState.end;
            this.handleEndTouch();
        }, this);

        this.node.on<cc.Event.EventTouch>(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            if (this.state != TouchState.begin) return;
            this.state = TouchState.end;  
            this.handleEndTouch();        
        }, this);
    }

    handleTouchPosition(x: number) {
        let curV: Velocity;
        if (x < this.leftWidth) {
            curV = this.leftVelocity;
        } else if (x < this.leftWidth + this.midWidth) {
            curV = this.midVelocity;
        } else {
            curV = this.rightVelocity;
        }

        this.sendEvent(curV);
    }

    handleEndTouch() {
        this.sendEvent(Velocity.stop);
    }

    sendEvent(v: Velocity) {
        cc.systemEvent.emit(MyName(MyEvent.volecity), v);
    }
}
