// TerrainCollision.ts
// 碰撞组件
// 拥有此组件的单位会进行碰撞检测
// lly 2017.12.12

const {ccclass, property, executionOrder, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";
import {TerrainManager, CollisionType} from './TerrainManager'; 

@ccclass
@executionOrder(EXECUTION_ORDER.TerrainCollision)
@requireComponent(MovableObject)
export default class TerrainCollision extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地图的碰撞检测 */
    terrainMgr: TerrainManager = null;

    /** 当前碰撞状态 */
    curXCollisionType: CollisionType = CollisionType.none;
    curYCollisionType: CollisionType = CollisionType.none;

    onLoad() {
        this.movableObj = this.getComponent(MovableObject);
        this.terrainMgr = cc.director.getScene().getComponentInChildren(TerrainManager);
    }

    update(dt: number) {
        let saveX = this.node.x; // 在没有碰撞的情况下，x该到的位置  
        let {xDir, yDir} = this.movableObj.getDir(); // 获取方向
        let {x: lastX, y: lastY} = this.movableObj.getLastPos();
        let size = this.node.getContentSize();

        if (xDir != 0) {
            let checkX = this.node.x + size.width * 0.5 * xDir;
            let checkY = this.node.y - size.height * 0.5;
            let checkYEnd = checkY + size.height;
            let collisionType: CollisionType = this.terrainMgr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);
            if (collisionType == CollisionType.entity) { // 有碰撞
                let distance = this.terrainMgr.getDistanceToTileSide(checkX, xDir);
                let xPos = this.node.x - distance;

                // 第一次检测x碰撞，其后退不可超过上次点的位置，否则会有y轴判断的错误
                if (xDir > 0) xPos = Math.max(xPos, lastX);
                else xPos = Math.min(xPos, lastX);

                this.node.x = xPos;                  
            }
        }

        if (yDir != 0) {
            let checkX = this.node.x - size.width * 0.5; // 从后往前计算上下的碰撞
            let checkXEnd = checkX + size.width - 1; // 使能通过标准的一个瓦片所以减1

            let checkY = this.node.y + size.height * 0.5 * yDir;
            
            this.curYCollisionType = this.terrainMgr.checkCollideInHorizontalLine(checkX, checkXEnd, checkY);
            if (this.curYCollisionType == CollisionType.entity) { // 有碰撞
                let distance = this.terrainMgr.getDistanceToTileSide(checkY, yDir);
                this.node.y -= distance;
                this.movableObj.yVelocity = 0;

            } else if (this.curYCollisionType == CollisionType.platform) { // 有只向下而且能越过的碰撞
                if (yDir < 0) { // 只检测向下
                    let distance = this.terrainMgr.getDistanceToTileSide(checkY, yDir);
                    let nodeYInMargin = this.node.y - distance;
                    
                    if (lastY - nodeYInMargin > -0.01) { // 用上一个点是否在边缘之上来确定是否碰撞，可以用改变上一点的方式越过
                        this.node.y = nodeYInMargin;
                        this.movableObj.yVelocity = 0;
                    }
                } else {
                    this.curYCollisionType = CollisionType.none; // 不是向下则platform不可碰撞
                }
            }
        }
        
        // 第一次x碰撞检测可能会因为y轴碰撞未进行而导致误判，
        // 所以需要在y检测后再检测一次，如果未碰撞则移动到相应位置
        if (xDir != 0) {
            let checkX = saveX + size.width * 0.5 * xDir;
            let checkY = this.node.y - size.height * 0.5;
            let checkYEnd = checkY + size.height;
            this.curXCollisionType = this.terrainMgr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);
            if (this.curXCollisionType == CollisionType.none) {
                this.node.x = saveX;
            } else {
                this.movableObj.xVelocity = 0;
            }
        }
    }
}