// TerrainCollider.ts
// 地形碰撞组件
// 拥有此组件的单位会进行与地形形成碰撞
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

import MovableObject from "./MovableObject";
import {TerrainCtrlr, CollisionType, SlopeAttris} from "./TerrainCtrlr"; 

@ccclass
@executionOrder(EXECUTION_ORDER.TerrainCollider)
export default class TerrainCollider extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地图的碰撞检测 */
    terrainCtrlr: TerrainCtrlr = null;

    /** 当前碰撞状态 */
    curXCollisionType: CollisionType = CollisionType.none;
    curYCollisionType: CollisionType = CollisionType.none;

    /** 边缘方向，只针对y轴向下 */
    edgeDir: number = 0;

    /** x轴方向是否出界 */
    xOutRangeDir: number = 0;
    /** y轴方向是否出界 */
    yOutRangeDir: number = 0;

    onLoad() {
        requireComponents(this, [MovableObject]);

        this.movableObj = this.getComponent(MovableObject);
        this.terrainCtrlr = cc.director.getScene().getComponentInChildren(TerrainCtrlr);
    }

    update(dt: number) {
        let saveX = this.node.x; // 在没有碰撞的情况下，x该到的位置  
        let {xDir, yDir} = this.movableObj.getDir(); // 获取方向
        let size = this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();

        //========================================================

        if (xDir != 0) {
            let checkX = this.node.x - size.width * anchor.x + (xDir > 0 ? size.width : 0);
            let checkY = this.node.y - size.height * anchor.y;
            let checkYEnd = checkY + size.height - 1;
            let collisionType: CollisionType = this.terrainCtrlr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);
            if (collisionType == CollisionType.entity || 
                collisionType == CollisionType.slope) { // 有碰撞

                let distance = this.terrainCtrlr.getDistanceToTileSide(checkX, xDir);
                let xPos = this.node.x - distance;
               
                if (xDir > 0) xPos = Math.max(xPos, this.movableObj.xLastPos); // 第一次检测x碰撞，其后退不可超过上次点的位置，否则会有y轴判断的错误
                else xPos = Math.min(xPos, this.movableObj.xLastPos);

                this.node.x = xPos;                  
            }
        }

        //========================================================

        if (yDir != 0) {
            let checkX = this.node.x - size.width * anchor.x; // 从左往右计算上下的碰撞
            let checkXEnd = checkX + size.width - 1; // 使能通过标准的一个瓦片所以减1

            let checkY = this.node.y - size.height * anchor.y + (yDir > 0 ? size.height : 0);
            
            let {type, edgeDir} = this.terrainCtrlr.checkCollideInHorizontalLine(checkX, checkXEnd, checkY);

            this.curYCollisionType = type;
            this.edgeDir = yDir < 0 ? edgeDir : 0;

            if (this.curYCollisionType == CollisionType.entity) { // 有碰撞
                let distance = this.terrainCtrlr.getDistanceToTileSide(checkY, yDir);
                this.node.y -= distance;
                this.movableObj.yVelocity = 0;

            } else if (this.curYCollisionType == CollisionType.platform) { // 有只向下而且能越过的碰撞
                if (yDir < 0) { // 只检测向下
                    let distance = this.terrainCtrlr.getDistanceToTileSide(checkY, yDir);
                    let nodeYInMargin = this.node.y - distance;
                    
                    if (this.movableObj.yLastPos - nodeYInMargin > -0.01) { // 用上一个点是否在边缘之上来确定是否碰撞，可以用改变上一点的方式越过
                        this.node.y = nodeYInMargin;
                        this.movableObj.yVelocity = 0;
                    } else {
                        this.curYCollisionType = CollisionType.none; // 过了最上一条边后就不可碰撞了
                    }
                } else {
                    this.curYCollisionType = CollisionType.none; // 不是向下则platform不可碰撞
                }
            }
        }

        //========================================================
        
        // 第一次x碰撞检测可能会因为y轴碰撞未进行而导致误判，
        // 所以需要在y检测后再检测一次，如果未碰撞则移动到相应位置
        let checkXDir = xDir != 0 ? xDir : -1; // xDir为0时，检测其左侧先，所以视为-1；
        let checkX = saveX - size.width * anchor.x + (checkXDir > 0 ? size.width : 0);
        let checkY = this.node.y - size.height * anchor.y;
        let checkYEnd = checkY + size.height - 1;
        this.curXCollisionType = this.terrainCtrlr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);
        if (this.curXCollisionType == CollisionType.entity) {
            this.movableObj.xVelocity = 0;

        } else if (this.curXCollisionType == CollisionType.slope) {
            this.node.x = saveX;

            let attris: SlopeAttris = this.terrainCtrlr.getSlopeAttris(checkX, checkYEnd, checkY);

            if (checkXDir == attris.dir) { // 方向相同，则表示在厚边方向，先尝试后撤，不行的话上移
                let distance = this.terrainCtrlr.getDistanceToTileSide(checkX, checkXDir);
                let xPos = this.node.x - distance;

                if ((checkXDir > 0 && this.movableObj.xLastPos <= xPos) || (checkXDir < 0 && this.movableObj.xLastPos >= xPos)) {
                    this.node.x = xPos;
                    this.movableObj.xVelocity = 0;
                } else {
                    let distance = this.terrainCtrlr.getDistanceToTileSide(checkY, -1);
                    this.node.y += distance;
                    this.movableObj.yVelocity = 0;
                }

            } else { 
                let yOffset = this.terrainCtrlr.getSlopeOffset(checkX, checkYEnd, checkY);
                if (yOffset >= 0) {
                    this.node.y += yOffset;
                    this.movableObj.yVelocity = 0;
                }               
            }
        
        } else {
            this.node.x = saveX;
        }

        // 检测背后是否是斜面
        checkXDir *= -1;
        checkX = saveX - size.width * anchor.x + (checkXDir > 0 ? size.width : 0);
        let backCollisionType = this.terrainCtrlr.checkCollideInVerticalLine(checkX, checkY, checkYEnd);

        //========================================================

        // 计算是否出界 // 不可超出范围
        if (xDir != 0) {
            let xCenter: number = this.node.x + size.width * (0.5 - anchor.x);
            if (xCenter < 0) {
                this.node.x -= xCenter; 
                this.xOutRangeDir = -1;
            } else if (this.terrainCtrlr.terrainSize.width < xCenter) {
                this.node.x -= xCenter - this.terrainCtrlr.terrainSize.width;
                this.xOutRangeDir = 1;
            } else {
                this.xOutRangeDir = 0;
            }
        } else {
            this.xOutRangeDir = 0;
        }

        if (yDir != 0) {
            let yCenter: number = this.node.y + size.height * (0.5 - anchor.y);
            if (yCenter < 0) {
                this.node.y -= yCenter; 
                this.yOutRangeDir = -1;
            } else if (this.terrainCtrlr.terrainSize.height < yCenter) {
                this.node.y -= yCenter - this.terrainCtrlr.terrainSize.height;
                this.yOutRangeDir = 1;
            } else {
                this.yOutRangeDir = 0;
            }
        } else {
            this.yOutRangeDir = 0;
        }
    }
}