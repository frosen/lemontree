// Gravity.ts
// 重力组件
// 拥有此组件的单位会受到重力的影响
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

const DefaultAccel: number = -2; // 默认重力加速度
const SpeedMax: number = 35; // 速度最大值（必为正数）

@ccclass
@executionOrder(EXECUTION_ORDER.Gravity)
export default class Gravity extends cc.Component {

    yAccel: number = DefaultAccel; // 当前重力加速度
    lastY: number = null; // 上一帧的y分量，和当前的y值差视为重力速度

    onLoad() {
        this.lastY = this.node.y;
    }

    update(dt: number) {
        let lastSpeed: number = this.node.y - this.lastY;
        let curSpeed: number = lastSpeed + (this.yAccel * dt);
        curSpeed = Math.min(Math.max(curSpeed, -SpeedMax), SpeedMax);

        this.lastY = this.node.y;
        this.node.y += curSpeed;
    }

    // 跳跃 重新设置上一帧的位置，就可以在当前帧计算出新的速度
    setSpeed(y: number) {
        this.lastY = this.node.y - y;
    }
}
