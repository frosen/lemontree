// MovableObject.ts
// 可移动对象
// 有这个组件的单位才可以进行移动，跳跃；该组件为对象设置速度和加速度
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

/** 速度最大值（必为正数）不得超过一个tile的宽度 */
const VelocityMax: number = 30;

@ccclass
@executionOrder(EXECUTION_ORDER.MovableObject)
export default class MovableObject extends cc.Component {

    /** 当前x加速度 */
    xAccel: number = 0;
    /** 当前y加速度 */
    yAccel: number = 0;

    /** x速度，不受加速度影响 */
    xVelocity: number = 0;
    /** y速度，不受加速度影响 */
    yVelocity: number = 0;

    update(dt: number) {
        // x
        this.xVelocity += (this.xAccel * dt);
        let xVelocityPerFrame = this.xVelocity * dt
        xVelocityPerFrame = Math.min(Math.max(xVelocityPerFrame, -VelocityMax), VelocityMax);
        this.node.y += xVelocityPerFrame;

        // y
        this.yVelocity += (this.yAccel * dt);
        let yVelocityPerFrame = this.yVelocity * dt
        yVelocityPerFrame = Math.min(Math.max(yVelocityPerFrame, -VelocityMax), VelocityMax);
        this.node.y += yVelocityPerFrame;
    }

    /**
     * 设置初始速度，随后会按照其速度匀速运动，除非有加速度
     * @param xVelocity: 每秒钟运动的x像素数量，为null则不设置
     * @param yVelocity: 每秒钟运动的y像素数量，为null则不设置
     */
    setInitialVelocity(xVelocity: number, yVelocity: number) {
        if (xVelocity) this.xVelocity = xVelocity;
        if (yVelocity) this.yVelocity = yVelocity;
    }

    /**
     * 设置加速度
     * @param xAccel: 当前帧中，换算成每秒钟改变x速度的量，为null则不设置
     * @param yAccel: 当前帧中，换算成每秒钟改变y速度的量，为null则不设置
     */
    setAccel(xAccel: number, yAccel: number) {
        if (xAccel) this.xAccel = xAccel;
        if (yAccel) this.yAccel = yAccel;
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

    /**
     * 获取上次点位置
     * @return 上次点位置
     */
    getLastPos(): {x: number, y: number} {
        return {
            x: this.node.x - this.xVelocity,
            y: this.node.y - this.yVelocity
        }
    }
}

