// Hero.ts
// 主角控制
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

// 方向
enum Direction {
    D0, D45, 
	D90, D135, 
	D180, D225, 
	D270, D315, 
	Dnone,
}

enum BodyDirection {
    left,
    littleLeft,
    mid,
    littleRight,
    right,
}

// x和y轴的不同比率下对应的方向
const DIR_RATE = [
    {r: -2.4142, e1: Direction.D270,   e2: Direction.D90},
    {r: -0.4142, e1: Direction.D315,   e2: Direction.D135},
    {r:  0.4142, e1: Direction.D0,     e2: Direction.D180},
    {r:  2.4142, e1: Direction.D45,    e2: Direction.D225},
    {r: Number.MAX_VALUE, e1: Direction.D90,    e2: Direction.D270},
]
const CUT45: number = 0.3535;
const CUT90: number = 0.5;

@ccclass
export default class Hero extends cc.Component {

    @property(cc.Node) 
    rangeNode: cc.Node = null;

    @property
    speedMax: number = 3;

    @property(cc.SpriteFrame)
    midFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    littleLeftFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    leftFrame: cc.SpriteFrame = null;

    curPos: cc.Vec2 = null;

    curBodyDir: BodyDirection = BodyDirection.mid;

    onLoad() {
        this.initEvent();
    }

    initEvent() {
        cc.systemEvent.on(MyName(MyEvent.move), function(e) {
            let {xRate, yRate} = e.detail;
            this.curPos = new cc.Vec2(xRate * this.rangeNode.width, yRate * this.rangeNode.height);
        }, this);

        cc.systemEvent.on(MyName(MyEvent.endMove), function(e) {
            this.curPos = null;
        }, this);

        cc.systemEvent.on(MyName(MyEvent.hurt), this.handleHurt, this);
        cc.systemEvent.on(MyName(MyEvent.hurtEnd), this.handleHurtEnd, this);
        cc.systemEvent.on(MyName(MyEvent.dead), this.handleDead, this);
    }

    onDestory() {
        cc.systemEvent.targetOff(this);
    }

    update() {
        let {disX, disY, r} = this.updatePosition();

        // 获取移动方向
        let dir: Direction = this.getDirection(disX, disY, r);

        // 根据移动方向，更新身体朝向
        this.updateBodyDirection(dir);
    }

    updatePosition(): {disX: number, disY: number, r: number} {
        if (!this.curPos || this.curPos.equals(this.node.position)) {           
            return {
                disX: 0,
                disY: 0,
                r: 0
            };
        }

        let aimX: number = this.curPos.x;
        let aimY: number = this.curPos.y;
        let oriX: number = this.node.position.x;
        let oriY: number = this.node.position.y;

        // 对最高速度的限制
        let disX: number = aimX - oriX;
        let disY: number = aimY - oriY;

        let r2 = disX * disX + disY * disY;
        let r = Math.pow(r2, 0.5);
        if (r > this.speedMax) {           
            aimX = disX * this.speedMax / r + oriX;
            aimY = disY * this.speedMax / r + oriY;
        }

        // 限制范围
        if (aimX < this.rangeNode.x) {
            aimX = this.rangeNode.x
        } else if (this.rangeNode.x + this.rangeNode.width < aimX) {
            aimX = this.rangeNode.x + this.rangeNode.width;
        }

        if (aimY < this.rangeNode.y) {
            aimY = this.rangeNode.y
        } else if (this.rangeNode.y + this.rangeNode.height < aimY) {
            aimY = this.rangeNode.y + this.rangeNode.height;
        }
        
        // 设置新位置
        this.node.setPosition(aimX, aimY);

        return {
            disX: disX,
            disY: disY,
            r: r
        }
    }

    // 缓冲区，为防止方向变化频繁而抖动
    xBuffer: number = 0;
    yBuffer: number = 0;

    getDirection(dx: number, dy: number, r: number): Direction {
        let curDirection: Direction;

        if (dy == 0) {
            if (dx > 0) curDirection = Direction.D0;
            else if (dx < 0) curDirection = Direction.D180;
        } else {
            let rate = (dx + r * this.xBuffer) / (dy + r * this.yBuffer);   
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

        return curDirection;
    }

    setBuffer(dir: Direction) {
        switch (dir) {
            case Direction.D0:    this.xBuffer = 0;      this.yBuffer = CUT90;  break;
            case Direction.D45:   this.xBuffer = CUT45;  this.yBuffer = CUT45;  break;
            case Direction.D90:   this.xBuffer = CUT90;  this.yBuffer = 0;      break;
            case Direction.D135:  this.xBuffer = CUT45;  this.yBuffer = -CUT45; break;              
            case Direction.D180:  this.xBuffer = 0;      this.yBuffer = -CUT90; break;
            case Direction.D225:  this.xBuffer = -CUT45; this.yBuffer = -CUT45; break;
            case Direction.D270:  this.xBuffer = -CUT90; this.yBuffer = 0;      break;
            case Direction.D315:  this.xBuffer = -CUT45; this.yBuffer = CUT45;  break;
            case Direction.Dnone: this.xBuffer = 0;      this.yBuffer = 0;      break;
            default: break;
        }
    }

    updateBodyDirection(dir: Direction) {
        let nextBodyDir: BodyDirection = BodyDirection.mid;
        switch (dir) {
            case Direction.D0:
            case Direction.D180:
            case Direction.Dnone:
                nextBodyDir = BodyDirection.mid;
                break;

            case Direction.D315:
            case Direction.D225:
                nextBodyDir = BodyDirection.littleLeft;
                break;

            case Direction.D270:
                nextBodyDir = BodyDirection.left;
                break;

            case Direction.D45:
            case Direction.D135:
                nextBodyDir = BodyDirection.littleRight;
                break;

            case Direction.D90:
                nextBodyDir = BodyDirection.right;
                break;
        }

        if (this.curBodyDir == nextBodyDir) return;  
        this.curBodyDir = nextBodyDir; 
        let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
        switch(nextBodyDir) {
            case BodyDirection.mid:         sp.spriteFrame = this.midFrame;        this.node.scaleX = 1;  break;
            case BodyDirection.littleLeft:  sp.spriteFrame = this.littleLeftFrame; this.node.scaleX = 1;  break;
            case BodyDirection.left:        sp.spriteFrame = this.leftFrame;       this.node.scaleX = 1;  break;
            case BodyDirection.littleRight: sp.spriteFrame = this.littleLeftFrame; this.node.scaleX = -1; break;
            case BodyDirection.right:       sp.spriteFrame = this.leftFrame;       this.node.scaleX = -1; break;
        }
    }

    hurtAct: cc.Action = null;
    handleHurt() {
        this.hurtAct = this.node.runAction(cc.repeatForever(cc.sequence(
            cc.fadeTo(0.05, 50),
            cc.fadeIn(0.05),
        )));
    }

    handleHurtEnd() {
        if (this.hurtAct) {
            this.node.stopAction(this.hurtAct);
            this.node.opacity = 255;
            this.hurtAct = null;
        }
    }

    handleDead() {
        cc.log("dead!!");
    }

    getAimPosOrNull(): {aimX: number, aimY: number} {
        if (this.curPos) {
            return {
                aimX: this.curPos.x,
                aimY: this.curPos.y
            }
        } else {
            return null;
        }       
    }
}
