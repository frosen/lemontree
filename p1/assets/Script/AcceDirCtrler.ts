// AcceDirCtrler.ts
// 加速器
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName, Direction} from './ConstValue'

enum AcceState {
    begin,
    move,
    pause,
}

// x和y轴的不同比率下对应的方向
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

    // 加速器状态
    state: AcceState = AcceState.pause;

    // 加速器开启时候的初始值，随后移动时与初始值的差视为移动方向
    xOrignal: number = 0;
    yOrignal: number = 0;

    // 缓冲区，为防止方向变化频繁而抖动
    xBuffer: number = 0;
    yBuffer: number = 0;

    // 精确值，控制方向对加速器的敏感度
    precison: number = 5;
    precision22p5: number = 0;
    precision45: number = 0;
    precision67p5: number = 0;
    precision90: number = 0;
    precisionPause: number = 0;

    onLoad() {
        this.setPrecision(5);
        this.initEvent();

        // 开启并设置加速器
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    setPrecision(n: number) {
        if (n < 0) n = 0;
        
        this.precison = n;
        this.precision22p5 = cut22p5 * n * 2;
        this.precision45 = cut45 * n * 2;
        this.precision67p5 = cut67p5 * n * 2;
        this.precision90 = cut90 * n * 2;

        this.precisionPause = 0.01 * n;
    }

    initEvent() {
        // 开启，关闭加速器：速度不为0的时候开启，否则关闭
        cc.systemEvent.on(MyName(MyEvent.volecity), function(e) {
            let speed = e.detail as number;
            if (speed > 0) {
                if (this.state == AcceState.pause) {
                    this.state = AcceState.begin;
                }
            } else {
                this.state = AcceState.pause;
            }
            
        }, this);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    onDeviceMotionEvent(event) {
        let curDirection: Direction = Direction.Dnone;

        switch (this.state) {
            case AcceState.begin:
                this.xOrignal = event.acc.x;
                this.yOrignal = event.acc.y;
                this.state = AcceState.move;
                break;

            case AcceState.move:
                let dx = event.acc.x - this.xOrignal;
                let dy = event.acc.y - this.yOrignal;

                if (Math.abs(dx) > this.precisionPause || Math.abs(dy) > this.precisionPause) {
                    dx = dx + this.xBuffer;
                    dy = dy + this.yBuffer;
    
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
        cc.systemEvent.emit(MyName(MyEvent.direction), dir);
    }
}
