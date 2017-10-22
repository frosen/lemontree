const {ccclass, property} = cc._decorator;
import {MyEvent, Direction} from './ConstValue'

enum AcceState {
    BEGIN,
    MOVE,
    PAUSE
}

const DIR_RATE = [
    {r: -5.0273, e1: Direction.D90,    e2: Direction.D270},
    {r: -1.4966, e1: Direction.D112p5, e2: Direction.D292p5},
    {r: -0.6682, e1: Direction.D135,   e2: Direction.D315},
    {r: -0.1989, e1: Direction.D157p5, e2: Direction.D337p5},
    {r:  0.1989, e1: Direction.D0,     e2: Direction.D180},
    {r:  0.6682, e1: Direction.D22p5,  e2: Direction.D202p5},
    {r:  1.4966, e1: Direction.D45,    e2: Direction.D225},
    {r:  5.0273, e1: Direction.D67p5,  e2: Direction.D247p5},
    {r: Number.MAX_VALUE, e1: Direction.D67p5, e2: Direction.D247p5},
]

const cut22p5: number = 0.001915
const cut45: number = 0.003535
const cut67p5: number = 0.00462
const cut90: number = 0.005

@ccclass
export default class AcceDirCtrler extends cc.Component {

    state: AcceState = AcceState.PAUSE;

    xOrignal: number = 0;
    yOrignal: number = 0;

    xBuffer: number = 0;
    yBuffer: number = 0;

    precison: number = 5;
    precision22p5: number = 0;
    precision45: number = 0;
    precision67p5: number = 0;
    precision90: number = 0;

    onLoad() {
        this.setPrecision(5);
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    setPrecision(n: number) {
        if (n < 0) n = 0;
        
        this.precison = n;
        this.precision22p5 = cut22p5 * n;
        this.precision45 = cut45 * n;
        this.precision67p5 = cut67p5 * n;
        this.precision90 = cut90 * n;
    }

    initEvent() {
        cc.systemEvent.on(MyEvent.beginAcce, function(e) {
            this.state = AcceState.BEGIN;
        }, this);

        cc.systemEvent.on(MyEvent.endAcce, function(e) {
            this.state = AcceState.PAUSE;
        }, this);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    onDeviceMotionEvent(event) {
        cc.log("AcceDirCtrler ==> " + event.acc.x + "   " + event.acc.y);

        let curDirection: Direction = Direction.Dnone;

        switch (this.state) {
            case AcceState.BEGIN:
                this.xOrignal = event.acc.x;
                this.yOrignal = event.acc.y;
                this.state = AcceState.MOVE;
                break;

            case AcceState.MOVE:
                let dx = event.acc.x - this.xOrignal + this.xBuffer;
                let dy = event.acc.y - this.yOrignal + this.yBuffer;

                if (dy == 0) {
                    if (dx > 0) {
                        curDirection = Direction.D90;
                    } else if (dx < 0) {
                        curDirection = Direction.D270;
                    }
                } else {
                    let rate = dx / dy;

                    if (rate <= DIR_RATE[3].r)
                        if (rate <= DIR_RATE[1].r)
                            if (rate <= DIR_RATE[0].r) curDirection = dx > 0 ? DIR_RATE[0].e1 : DIR_RATE[0].e2;
                            else curDirection = dx > 0 ? DIR_RATE[1].e1 : DIR_RATE[1].e2;
                        else
                            if (rate <= DIR_RATE[2].r) curDirection = dx > 0 ? DIR_RATE[2].e1 : DIR_RATE[2].e2;
                            else curDirection = dx > 0 ? DIR_RATE[3].e1 : DIR_RATE[3].e2;
                    else
                        if (rate <= DIR_RATE[6].r)
                            if (rate <= DIR_RATE[4].r) curDirection = dy > 0 ? DIR_RATE[4].e1 : DIR_RATE[4].e2;
                            else if (rate <= DIR_RATE[5].r) curDirection = dx > 0 ? DIR_RATE[5].e1 : DIR_RATE[5].e2;
                            else curDirection = dx > 0 ? DIR_RATE[6].e1 : DIR_RATE[6].e2;
                        else
                            if (rate <= DIR_RATE[7].r) curDirection = dx > 0 ? DIR_RATE[7].e1 : DIR_RATE[7].e2;
                            else curDirection = dx > 0 ? DIR_RATE[8].e1 : DIR_RATE[8].e2;	
                }

                this.setBuffer(curDirection);           
                this.sendEvent(curDirection);

                break;

            default:
                break;
        }
    }

    setBuffer(dir: Direction) {
        switch (dir) {
            case Direction.D0:
                this.xBuffer = 0;
                this.yBuffer = this.precision90;
                break;
            case Direction.D22p5:
                this.xBuffer = this.precision22p5;
                this.yBuffer = this.precision67p5;
                break;
            case Direction.D45:
                this.xBuffer = this.precision45;
                this.yBuffer = this.precision45;
                break;
            case Direction.D67p5:
                this.xBuffer = this.precision67p5;
                this.yBuffer = this.precision22p5;
                break;
            case Direction.D90:
                this.xBuffer = this.precision90;
                this.yBuffer = 0;
                break;
            case Direction.D112p5:
                this.xBuffer = this.precision67p5;
                this.yBuffer = -this.precision22p5;
                break;
            case Direction.D135:
                this.xBuffer = this.precision45;
                this.yBuffer = -this.precision45;
                break;
            case Direction.D157p5:
                this.xBuffer = this.precision22p5;
                this.yBuffer = -this.precision67p5;
                break;
            case Direction.D180:
                this.xBuffer = 0;
                this.yBuffer = -this.precision90;
                break;
            case Direction.D202p5:
                this.xBuffer = -this.precision22p5;
                this.yBuffer = -this.precision67p5;
                break;
            case Direction.D225:
                this.xBuffer = -this.precision45;
                this.yBuffer = -this.precision45;
                break;
            case Direction.D247p5:
                this.xBuffer = -this.precision67p5;
                this.yBuffer = -this.precision22p5;
                break;
            case Direction.D270:
                this.xBuffer = -this.precision90;
                this.yBuffer = 0;
                break;
            case Direction.D292p5:
                this.xBuffer = -this.precision67p5;
                this.yBuffer = this.precision22p5;
                break;
            case Direction.D315:
                this.xBuffer = -this.precision45;
                this.yBuffer = this.precision45;
                break;
            case Direction.D337p5:
                this.xBuffer = -this.precision22p5;
                this.yBuffer = this.precision67p5;
                break;
            case Direction.Dnone:
                this.xBuffer = 0;
                this.yBuffer = 0;
                break;
            default:
                break;
        }
    }

    sendEvent(dir: Direction) {
        cc.log(dir.toString());
    }
}
