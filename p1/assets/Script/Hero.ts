// Hero.ts
// 主角控制
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName, Direction, getDirVector, Velocity} from './ConstValue'

@ccclass
export default class Hero extends cc.Component {

    curVolecity: Velocity = Velocity.stop;
    curDirection: Direction = Direction.Dnone;

    @property(cc.Node) 
    rangeNode: cc.Node = null;

    @property
    slowFactor: number = 1

    @property
    midFactor: number = 2

    @property
    fastFactor: number = 3

    onLoad() {
        this.initEvent();     
    }

    initEvent() {
        cc.systemEvent.on(MyName(MyEvent.volecity), function(e) {
            let v = e.detail as Velocity;
            this.curVolecity = v;
        }, this);

        cc.systemEvent.on(MyName(MyEvent.direction), function(e) {
            let dir = e.detail as Direction;
            this.curDirection = dir;
        }, this);
    }

    update() {
        this.updatePosition();
    }

    updatePosition() {
        if (this.curVolecity == Velocity.stop) {
            this.curDirection = Direction.Dnone;
            return;
        }

        // 根据枚举生成速度因数
        let factor: number
        if (this.curVolecity == Velocity.slow) {
            factor = this.slowFactor;
        } else if (this.curVolecity == Velocity.mid) {
            factor = this.midFactor;
        } else {
            factor = this.fastFactor;
        }

        // 生成新位置
        let {x, y} = getDirVector(this.curDirection);
        let newX = this.node.x + x * factor;
        let newY = this.node.y + y * factor;

        // 控制范围
        if (this.rangeNode) {
            if (newX < this.rangeNode.x) {
                newX = this.rangeNode.x
            } else if (this.rangeNode.x + this.rangeNode.width < newX) {
                newX = this.rangeNode.x + this.rangeNode.width;
            }

            if (newY < this.rangeNode.y) {
                newY = this.rangeNode.y
            } else if (this.rangeNode.y + this.rangeNode.height < newY) {
                newY = this.rangeNode.y + this.rangeNode.height;
            }
        }

        // 设置新位置
        this.node.setPosition(newX, newY);
    }
}
