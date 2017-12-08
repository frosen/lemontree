// Hero.ts
// 主角控制
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

// 方向
enum Direction {
    up, down, left, right, none
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
    {r: -1, e1: Direction.left, e2: Direction.right},
    {r:  1, e1: Direction.up,   e2: Direction.down},
    {r: Number.MAX_VALUE, e1: Direction.right, e2: Direction.left},
]

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

    curBodyDir: BodyDirection = BodyDirection.mid; // 当前身体方向
    nextBodyDir: BodyDirection = BodyDirection.mid; // 即将要成为的身体方向

    @property
    dirChangeInterval: number = 0; // 方向UI变化，每个帧的间隔（毫秒）

    dirChangeEndTime: number = 0; // 方向UI变化，每个帧变化的结束时间戳

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

        // 根据移动方向，更新身体朝向
        this.updateBodyDirection(disX, disY, r);
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

    updateBodyDirection(dx: number, dy: number, r: number) {
        // 变化过程中不再变化
        let curTime = (new Date()).valueOf();
        if (curTime < this.dirChangeEndTime) return;

        // 获取移动方向
        let dir: Direction = this.getDirection(dx, dy, r);
        this.nextBodyDir = this.getBodyDirection(dir);
        
        if (this.curBodyDir == this.nextBodyDir) return;

        // 执行变化
        switch(this.curBodyDir) {
            case BodyDirection.left:        this.onChangeAtLeft(); 		  break;
            case BodyDirection.littleLeft:  this.onChangeAtLittleLeft();  break;
            case BodyDirection.mid:         this.onChangeAtMid(); 		  break;   
            case BodyDirection.littleRight: this.onChangeAtLittleRight(); break;
            case BodyDirection.right:       this.onChangeAtRight(); 	  break; 
        }

        // 显示变化后的效果
        switch(this.curBodyDir) {
            case BodyDirection.left:        this.onLeft(); 		  break;
            case BodyDirection.littleLeft:  this.onLittleLeft();  break;
            case BodyDirection.mid:         this.onMid(); 		  break;   
            case BodyDirection.littleRight: this.onLittleRight(); break;
            case BodyDirection.right:       this.onRight(); 	  break; 
        }

        this.dirChangeEndTime = curTime + this.dirChangeInterval;
    }

    // 缓冲区，为防止方向变化频繁而抖动
    xBuffer: number = 0;
    yBuffer: number = 0;

    getDirection(dx: number, dy: number, r: number): Direction {
        let curDirection: Direction = Direction.none;

        if (dy == 0) {
            if (dx > 0) curDirection = Direction.up;
            else if (dx < 0) curDirection = Direction.down;
        } else {
            let rate = (dx + r * this.xBuffer) / (dy + r * this.yBuffer);
            if (rate < DIR_RATE[0].r) {
                curDirection = dy > 0 ? DIR_RATE[0].e1 : DIR_RATE[0].e2;
            } else if (rate < DIR_RATE[1].r) {
                curDirection = dy > 0 ? DIR_RATE[1].e1 : DIR_RATE[1].e2;
            } else {
                curDirection = dy > 0 ? DIR_RATE[2].e1 : DIR_RATE[2].e2;
            }
        }
        
        this.setBuffer(curDirection);

        return curDirection;
    }

    setBuffer(dir: Direction) {
        switch (dir) {
            case Direction.up:    this.xBuffer = 0;    this.yBuffer = 0.5;  break;
            case Direction.right: this.xBuffer = 0.5;  this.yBuffer = 0;    break;           
            case Direction.down:  this.xBuffer = 0;    this.yBuffer = -0.5; break;
            case Direction.left:  this.xBuffer = -0.5; this.yBuffer = 0;    break;
            case Direction.none:  this.xBuffer = 0;    this.yBuffer = 0;    break;
        }
    }

    getBodyDirection(dir: Direction): BodyDirection {
        let curBodyDir;
        switch (dir) {
            case Direction.up:
            case Direction.down:
            case Direction.none:
                curBodyDir = BodyDirection.mid;
                break;
            case Direction.left:
                curBodyDir = BodyDirection.left;
                break;
            case Direction.right:
                curBodyDir = BodyDirection.right;
                break;
        }
        return curBodyDir;
    }

    // ------------------------------------------------------------------------------------------

    onChangeAtLeft() {
        this.curBodyDir = BodyDirection.littleLeft;
    }

    onChangeAtLittleLeft() {
        if (this.nextBodyDir == BodyDirection.left) {
            this.curBodyDir = BodyDirection.left;
        } else {
            this.curBodyDir = BodyDirection.mid;
        }
    }

    onChangeAtMid() {
        if (this.nextBodyDir == BodyDirection.left || this.nextBodyDir == BodyDirection.littleLeft) {
            this.curBodyDir = BodyDirection.littleLeft;
        } else {
            this.curBodyDir = BodyDirection.littleRight;
        }
    }

    onChangeAtLittleRight() {
        if (this.nextBodyDir == BodyDirection.right) {
            this.curBodyDir = BodyDirection.right;
        } else {
            this.curBodyDir = BodyDirection.mid;
        }
    }

    onChangeAtRight() {
        this.curBodyDir = BodyDirection.littleRight;
    }

    // ------------------------------------------------------------------------------------------

    onLeft() {
        let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = this.leftFrame;
        this.node.scaleX = 1;
    }

    onLittleLeft() {
        let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = this.littleLeftFrame;
        this.node.scaleX = 1;
    }

    onMid() {
        let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = this.midFrame;
        this.node.scaleX = 1;
    }

    onLittleRight() {
        let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = this.littleLeftFrame;
        this.node.scaleX = -1;
    }

    onRight() {
        let sp: cc.Sprite = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = this.leftFrame;
        this.node.scaleX = -1;
    }

    // ------------------------------------------------------------------------------------------

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
