// Gravity.ts
// 重力组件
// 拥有此组件的单位会受到重力的影响
// lly 2017.12.12

const {ccclass, property, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";

/** 默认重力加速度 */
const DefaultAccel: number = -0.25;

@ccclass
@requireComponent(MovableObject)
export default class Gravity extends cc.Component {

    onLoad() {
        // 设置重力加速度即可
        this.getComponent(MovableObject).setAccel(null, DefaultAccel);
    }
    
}
