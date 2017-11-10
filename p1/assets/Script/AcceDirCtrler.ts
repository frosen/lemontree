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
    {r: -2.4142, e1: Direction.D270,   e2: Direction.D90},
    {r: -0.4142, e1: Direction.D315,   e2: Direction.D135},
    {r:  0.4142, e1: Direction.D0,     e2: Direction.D180},
    {r:  2.4142, e1: Direction.D45,    e2: Direction.D225},
    {r: Number.MAX_VALUE, e1: Direction.D90,    e2: Direction.D270},
]

const CUT45: number = 0.003535;
const CUT90: number = 0.005;

const PAUSE_PRECISION_FACTOR: number = 0.01;

const ACCE_PAUSE_VALUE = -100;

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
    precision45: number = 0;
    precision90: number = 0;

    precisionPause: number = 0;

    // 是否是背面朝上
    isBackUp = false;

    onLoad() {
        this.setPrecision(10);
        this.initEvent();

        // 开启并设置加速器
        cc.inputManager.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    setPrecision(n: number) {
        if (n < 0) n = 0;
        
        this.precison = n;
        this.precision45 = CUT45 * n;
        this.precision90 = CUT90 * n;

        this.precisionPause = PAUSE_PRECISION_FACTOR * n;
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
        switch (this.state) {
            case AcceState.begin:
                this.xOrignal = event.acc.x;
                this.yOrignal = event.acc.y;
                this.state = AcceState.move;
                this.isBackUp = event.acc.z > 0;
                break;

            case AcceState.move:
                let curDirection: Direction = Direction.Dnone;

                let dx = event.acc.x - this.xOrignal;
                let dy = event.acc.y - this.yOrignal;
                
                if (Math.sqrt(dx * dx + dy * dy) > this.precisionPause) {
                    
                    if (this.isBackUp) {
                        dx *= -1;
                        dy *= -1;
                    }

                    dx = dx + this.xBuffer;
                    dy = dy + this.yBuffer;
    
                    if (dy == 0) return;
                    
                    let rate = dx / dy;                   
                    if (rate <= DIR_RATE[3].r)
                        if (rate <= DIR_RATE[1].r)
                            if (rate <= DIR_RATE[0].r) curDirection = dy > 0 ? DIR_RATE[0].e1 : DIR_RATE[0].e2;
                            else curDirection = dy > 0 ? DIR_RATE[1].e1 : DIR_RATE[1].e2;
                        else
                            if (rate <= DIR_RATE[2].r) curDirection = dy > 0 ? DIR_RATE[2].e1 : DIR_RATE[2].e2;
                            else curDirection = dy > 0 ? DIR_RATE[3].e1 : DIR_RATE[3].e2;
                    else
                        curDirection = dy > 0 ? DIR_RATE[4].e1 : DIR_RATE[4].e2;
                }        

                this.setBuffer(curDirection);     
                this.sendEvent(curDirection);    
                this.saveAcceData(dx, dy, curDirection);            
                break;
            case AcceState.pause:
                this.saveAcceData(ACCE_PAUSE_VALUE, ACCE_PAUSE_VALUE, Direction.Dnone);
        }
    }

    setBuffer(dir: Direction) {
        switch (dir) {
            case Direction.D0:
                this.xBuffer = 0;
                this.yBuffer = this.precision90;
                break;

            case Direction.D45:
                this.xBuffer = this.precision45;
                this.yBuffer = this.precision45;
                break;

            case Direction.D90:
                this.xBuffer = this.precision90;
                this.yBuffer = 0;
                break;

            case Direction.D135:
                this.xBuffer = this.precision45;
                this.yBuffer = -this.precision45;
                break;
                
            case Direction.D180:
                this.xBuffer = 0;
                this.yBuffer = -this.precision90;
                break;

            case Direction.D225:
                this.xBuffer = -this.precision45;
                this.yBuffer = -this.precision45;
                break;

            case Direction.D270:
                this.xBuffer = -this.precision90;
                this.yBuffer = 0;
                break;

            case Direction.D315:
                this.xBuffer = -this.precision45;
                this.yBuffer = this.precision45;
                break;

            case Direction.Dnone:
                this.xBuffer = 0;
                this.yBuffer = 0;
                break;
            default:
                break;
        }
    }

    curAcceX: number = ACCE_PAUSE_VALUE;
    curAcceY: number = ACCE_PAUSE_VALUE;
    curDir: Direction = Direction.Dnone;
    saveAcceData(dx: number, dy: number, dir: Direction) {
        this.curAcceX = dx;
        this.curAcceY = dy;
        this.curDir = dir;
    }

    getAcceData(): {x: number, y: number, dir: Direction} {
        return {
            x: this.curAcceX,
            y: this.curAcceY,
            dir: this.curDir,
        }
    }

    getPausePrecision(): number {
        return this.precisionPause;
    }

    sendEvent(dir: Direction) {
        cc.systemEvent.emit(MyName(MyEvent.direction), dir);
    }
}
