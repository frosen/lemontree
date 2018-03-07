// MovableObject.ts
// 可移动对象
// 有这个组件的单位才可以进行移动，跳跃；该组件为对象设置速度和加速度
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

/** 速度最大值（必为正数）不得超过一个tile的宽度 */
export const VelocityMax: number = 15;

@ccclass
@executionOrder(EXECUTION_ORDER.MovableObject)
export class MovableObject extends cc.Component {

    xAccelEnabled: boolean = true;
    yAccelEnabled: boolean = true;

    /** 当前x加速度 */
    xAccel: number = 0;
    /** 当前y加速度 */
    yAccel: number = 0;

    /** x速度，不受加速度影响 */
    xVelocity: number = 0;
    /** y速度，不受加速度影响 */
    yVelocity: number = 0;

    xLastPos: number = 0;
    yLastPos: number = 0;

    xLastVelocity: number = 0;
    yLastVelocity: number = 0;

    update(dt: number) {
        this.xLastPos = this.node.x;
        this.yLastPos = this.node.y;
        this.xLastVelocity = this.xVelocity;
        this.yLastVelocity = this.yVelocity;

        // x
        if (this.xAccelEnabled) this.xVelocity += this.xAccel;
        this.xVelocity = Math.min(Math.max(this.xVelocity, -VelocityMax), VelocityMax);        
        this.node.x += this.xVelocity;

        // y
        if (this.yAccelEnabled) this.yVelocity += this.yAccel;
        this.yVelocity = Math.min(Math.max(this.yVelocity, -VelocityMax), VelocityMax);       
        this.node.y += this.yVelocity;
    }

    /**
     * 获取速度方向
     * @return xDir 1向右 -1向左 0停止；yDir 1向上 -1向下 0停止
     */
    getDir(): {xDir: number, yDir: number} {
        let x = 0;
        if (this.xVelocity > 0.001) x = 1;
        else if (this.xVelocity < -0.001) x = -1;

        let y = 0;
        if (this.yVelocity > 0.001) y = 1;
        else if (this.yVelocity < -0.001) y = -1;

        return {
            xDir: x,
            yDir: y
        }
    }
}

