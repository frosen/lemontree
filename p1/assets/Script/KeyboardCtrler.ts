// KeyboardCtrler.ts
// 键盘控制
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName, Direction, Velocity} from './ConstValue'

enum MoveState {
    begin,
    end,
}

@ccclass
export default class KeyboardCtrler extends cc.Component {

    u: boolean = false
    d: boolean = false
    l: boolean = false
    r: boolean = false

    slow: boolean = false
    fast: boolean = false

    state: MoveState = MoveState.end;

    onLoad() {
        // 开启键盘监控
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event) {
        switch(event.keyCode) {
            case cc.KEY.w: this.u = true; break;
            case cc.KEY.a: this.l = true; break;
            case cc.KEY.s: this.d = true; break;
            case cc.KEY.d: this.r = true; break;
            case cc.KEY.j: this.slow = true; break;
            case cc.KEY.k: this.fast = true; break;
        }
    }

    onKeyUp(event) {
        switch(event.keyCode) {
            case cc.KEY.w: this.u = false; break;
            case cc.KEY.a: this.l = false; break;
            case cc.KEY.s: this.d = false; break;
            case cc.KEY.d: this.r = false; break;
            case cc.KEY.j: this.slow = false; break;
            case cc.KEY.k: this.fast = false; break;
        }
    }

    update() {
        let dir: Direction = Direction.Dnone;
        if (this.u) {
            if (this.l) {
                dir = Direction.D315;
            } else if (this.r) {
                dir = Direction.D45;
            } else {
                dir = Direction.D0;
            }
        } else if (this.d) {
            if (this.l) {
                dir = Direction.D225;
            } else if (this.r) {
                dir = Direction.D135;
            } else {
                dir = Direction.D180;
            }
        } else if (this.l) {
            dir = Direction.D270;
        } else if (this.r) {
            dir = Direction.D90;
        }

        if (dir != Direction.Dnone) {
            this.state = MoveState.begin;
            let v: Velocity = Velocity.mid;
            if (this.slow) {
                v = Velocity.slow;
            } else if (this.fast) {
                v = Velocity.fast;
            }
            this.sendEvent(dir, v);
        } else {
            if (this.state == MoveState.begin) {
                this.state = MoveState.end;
                this.sendEvent(Direction.Dnone, Velocity.stop);
            }
        }
    }

    sendEvent(dir: Direction, v: Velocity) {
        cc.systemEvent.emit(MyName(MyEvent.volecity), v);
        cc.systemEvent.emit(MyName(MyEvent.direction), dir);
    }
}
