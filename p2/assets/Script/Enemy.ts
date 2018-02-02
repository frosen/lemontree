// Enemy.ts
// 敌人类：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

import MovableObject from "./MovableObject";
import Attack from "./Attack";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";

@ccclass
export default class Enemy extends cc.Component {

    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;
    /** 观察区碰撞组件 */
    watchCollider: ObjColliderForWatch = null;

    onLoad() {
        // init logic
        requireComponents(this, [Attack, ObjCollider, ObjColliderForWatch]);

        this.objCollider = this.getComponent(ObjCollider);
        this.watchCollider = this.getComponent(ObjColliderForWatch);

        // 回调
        this.objCollider.callback = this.onCollision.bind(this);
        this.watchCollider.callback = this.onWatching.bind(this);
    }

    // 碰撞回调 ------------------------------------------------------------

    onCollision(collisionDatas: CollisionData[]) {
        
    }

    onWatching(collisionDatas: CollisionData[]) {
        if (collisionDatas.length > 0) {
            // cc.log("enemy: yes, i see hero");
        }
    }
}
