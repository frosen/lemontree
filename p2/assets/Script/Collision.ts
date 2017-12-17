// Collision.ts
// 碰撞组件
// 拥有此组件的单位会进行碰撞检测
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

@ccclass
@executionOrder(EXECUTION_ORDER.Collision)
export default class Collision extends cc.Component {

    onLoad() {
        
    }

}