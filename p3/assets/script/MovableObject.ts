// MovableObject.ts
// 可移动对象
// 有这个组件的单位才可以进行移动，跳跃；该组件为对象设置速度和加速度
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

import MyComponent from "./MyComponent";

/** 速度最大值（必为正数）不得超过一个tile的宽度 */
export const VelocityMax: number = 15;

@ccclass
@executionOrder(EXECUTION_ORDER.MovableObject)
export class MovableObject extends MyComponent {

    /** 当前x加速度 */
    xAccel: number = 0;
    /** 当前y加速度 */
    yAccel: number = 0;

    /** x速度，不受加速度影响 */
    xVelocity: number = 0;
    /** y速度，不受加速度影响 */
    yVelocity: number = 0;

    /** x环境速度 */
    xEnvVelocity: number = 0;
    /** y环境速度 */
    yEnvVelocity: number = 0;

    xLastPos: number = 0;
    yLastPos: number = 0;

    xLastVelocity: number = 0;
    yLastVelocity: number = 0;

    xVelocityEnabled: boolean = true;
    yVelocityEnabled: boolean = true;

    update(_: number) {
        this.xLastPos = this.node.x;
        this.yLastPos = this.node.y;
        this.xLastVelocity = this.xVelocity;
        this.yLastVelocity = this.yVelocity;

        // x
        if (this.xVelocityEnabled) {
            this.xVelocity += this.xAccel;
            this.xVelocity = Math.min(Math.max(this.xVelocity, -VelocityMax), VelocityMax);        
            this.node.x += this.xVelocity + this.xEnvVelocity;
        } else {
            this.xVelocity = 0;
        }

        // y
        if (this.yVelocityEnabled) {
            this.yVelocity += this.yAccel;
            this.yVelocity = Math.min(Math.max(this.yVelocity, -VelocityMax), VelocityMax);       
            this.node.y += this.yVelocity + this.yEnvVelocity;
        } else {
            this.yVelocity = 0;
        }
    }

    /**
     * 获取速度方向
     * @return xDir 1向右 -1向左 0停止；yDir 1向上 -1向下 0停止
     */
    getDir(): {xDir: number, yDir: number} {
        let xDir = 0;
        if (this.xVelocity > 0.001) xDir = 1;
        else if (this.xVelocity < -0.001) xDir = -1;

        let yDir = 0;
        if (this.yVelocity > 0.001) yDir = 1;
        else if (this.yVelocity < -0.001) yDir = -1;

        return {xDir, yDir};
    }

    /**
     * 闪现（瞬移）到某个坐标
     */
    blink(x: number, y: number) {
        let curPos = this.node.position;
        let disX = x - curPos.x;
        let disY = y - curPos.y;

        this.node.position = cc.v2(x, y);
        this.xLastPos += disX;
        this.yLastPos += disY;
    }
}

