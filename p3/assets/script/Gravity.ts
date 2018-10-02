// Gravity.ts
// 重力组件
// 拥有此组件的单位会受到重力的影响
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import {MovableObject} from "./MovableObject";

/** 默认重力加速度 */
const DefaultAccel: number = -0.25;

@ccclass
export default class Gravity extends MyComponent {

    onLoad() {
        requireComponents(this, [MovableObject]);

        // 设置重力加速度即可
        this.getComponent(MovableObject).yAccel = DefaultAccel;
    }

}
