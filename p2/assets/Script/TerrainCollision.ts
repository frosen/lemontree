// TerrainCollision.ts
// 碰撞组件
// 拥有此组件的单位会进行碰撞检测
// lly 2017.12.12

const {ccclass, property, executionOrder, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";
import TerrainManager from './TerrainManager'; 

@ccclass
@executionOrder(EXECUTION_ORDER.TerrainCollision)
@requireComponent(MovableObject)
export default class TerrainCollision extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地图的碰撞检测 */
    terrainMgr: TerrainManager = null;

    /** 当前碰撞状态 */
    curXCollisionType: number = 0;
    curYCollisionType: number = 0;

    onLoad() {
        this.movableObj = this.getComponent(MovableObject);
        this.terrainMgr = cc.director.getScene().getComponentInChildren(TerrainManager);
    }

    update(dt: number) {
        let saveX = this.node.x;       
        let {xDir, yDir} = this.movableObj.getDir(); // 获取方向
        let size = this.node.getContentSize();

        if (xDir != 0) {
            let checkX = this.node.x + size.width * 0.5 * xDir;
            let checkY = this.node.y - size.height * 0.5;
            let checkYEnd = checkY + size.height;
            this.curXCollisionType = this.terrainMgr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);
            if (this.curXCollisionType == 1) { // 有碰撞
                let distance = this.terrainMgr.getDistanceToTileSide(checkX, xDir);
                this.node.x -= distance;
                this.movableObj.setInitialVelocity(0, null);
            }
        }

        if (yDir != 0) {
            let checkX = this.node.x - size.width * 0.5; // 从后往前计算上下的碰撞
            let checkXEnd = checkX + size.width - 1;

            let checkY = this.node.y + size.height * 0.5 * yDir;
            
            this.curYCollisionType = this.terrainMgr.checkCollideInHorizontalLine(checkX, checkXEnd, checkY);
            cc.log(this.curYCollisionType);
            if (this.curYCollisionType == 1) { // 有碰撞
                let distance = this.terrainMgr.getDistanceToTileSide(checkY, yDir);
                this.node.y -= distance;
                this.movableObj.setInitialVelocity(null, 0);

            } else if (this.curYCollisionType == 2) { // 有只向下而且能越过的碰撞
                if (yDir < 0) { // 只检测向下
                    let distance = this.terrainMgr.getDistanceToTileSide(checkY, yDir);
                    let nodeYInMargin = this.node.y - distance;
                    let {y: lastY} = this.movableObj.getLastPos();
                    if (lastY - nodeYInMargin > -0.01) { // 用上一个点是否在边缘之上来确定是否碰撞，可以用改变上一点的方式越过
                        this.node.y = nodeYInMargin;
                        this.movableObj.setInitialVelocity(null, 0);
                    }
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
            if (this.curXCollisionType == 0) {
                this.node.x = saveX;
                this.movableObj.setInitialVelocity(0, null);
            }
        }
    }

    /**
     * 获取碰撞状态
     * @return 0是无碰撞，1是碰撞块，2是只能从上到下碰撞
     */
    getCurCollisionType(): {x: number, y: number} {
        return {
            x: this.curXCollisionType,
            y: this.curXCollisionType
        }
    }
}