// Gravity.ts
// 重力组件
// 拥有此组件的单位会受到重力的影响
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

/** 默认重力加速度 */
const DefaultAccel: number = -2;
/** 速度最大值（必为正数） */
const SpeedMax: number = 35;

@ccclass
@executionOrder(EXECUTION_ORDER.Gravity)
export default class Gravity extends cc.Component {

    /** 当前重力加速度 */
    yAccel: number = DefaultAccel;
    /** 上一帧的y分量，和当前的y值差视为重力速度 */
    lastY: number = null;

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

}
