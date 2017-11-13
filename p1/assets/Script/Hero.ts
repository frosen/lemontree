// Hero.ts
// 主角控制
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

@ccclass
export default class Hero extends cc.Component {

    @property(cc.Node) 
    rangeNode: cc.Node = null;

    @property
    speedMax: number = 3;

    curPos: cc.Vec2 = null;

    onLoad() {
        this.initEvent();
    }

    initEvent() {
        cc.systemEvent.on(MyName(MyEvent.move), function(e) {
            let {xRate, yRate} = e.detail;
            this.curPos = new cc.Vec2(xRate * this.rangeNode.width, yRate * this.rangeNode.height);
            cc.log(this.rangeNode.width, this.rangeNode.height, this.curPos);
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
        this.updatePosition();
    }

    updatePosition() {
        if (!this.curPos) return;
        if (this.curPos.equals(this.node.position)) return;

        let aimX: number = this.curPos.x;
        let aimY: number = this.curPos.y;
        let oriX: number = this.node.position.x;
        let oriY: number = this.node.position.y;

        // 对最高速度的限制
        let disX: number = aimX - oriX;
        let disY: number = aimY - oriY;

        let r2 = disX * disX + disY * disY;
        if (r2 > this.speedMax * this.speedMax) {
            let r = Math.pow(r2, 0.5);
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
