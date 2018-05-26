// TerrainColliderForCreature.ts
// 生物（hero和enemy）的地形碰撞组件
// 拥有此组件的单位会进行与地形形成碰撞
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";
import {VelocityMax} from "./MovableObject";


@ccclass
export default class TerrainColliderForCreature extends TerrainCollider {

    update(dt: number) {
        super.update(dt);

        // 超级重力为了让对象可以沿着斜坡行进
        if (this.curYCollisionType == CollisionType.slope || 
            this.edgeType == CollisionType.slope ||
            this.backEdgeType == CollisionType.slope) {
            this.movableObj.yVelocity = -VelocityMax; 
        }

        // 计算是否出界 // X不可超出范围
        let size = this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();
        let xCenter: number = this.node.x + size.width * (0.5 - anchor.x);
        if (this.xOutRangeDir == -1) {          
            this.node.x -= xCenter;
        } else if (this.xOutRangeDir == 1) {
            this.node.x -= xCenter - this.terrainCtrlr.terrainSize.width;
        }
    }
}