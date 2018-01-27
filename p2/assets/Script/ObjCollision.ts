// ObjCollision.ts
// 对象碰撞
// 对象碰撞就是英雄，敌人以及相应武器法术之间的碰撞
// lly 2018.1.13

const {ccclass, property} = cc._decorator;

@ccclass
export default class ObjCollision extends cc.Component {

    radius: cc.Size = null;
    hide: boolean = false;

    /** 以此对象为父对象的次级碰撞对象的列表，次级碰撞对象需要额外计算位置 */
    subCollisions: ObjCollision[] = [];
    /** 当前帧中，此碰撞对象碰触到的其他碰撞对象的列表 */
    otherCollisionsInFrame: ObjCollision[] = [];

    /**
     * 获取最大最小x，y
     * @param 父碰撞对象，只有次级碰撞对象有，默认为空
     * @returns 获取最大最小x，y
     */        
    getMaxMinXY(parentCollision: ObjCollision = null): {minX: number, maxX: number, minY: number, maxY: number} {

        let node = this.node;
        let radius = this.radius || node.getContentSize();

        let minX = -radius.width * node.anchorX;
        let maxX = minX + node.width;
        let minY = -radius.height * node.anchorY;
        let maxY = minY + node.height;

        if (!parentCollision) {
            return {
                minX: minX + node.x,
                maxX: maxX + node.x,
                minY: minY + node.y,
                maxY: maxY + node.y
            }
        }

        // 转换到父碰撞对象的父节点的坐标中，可以让其和父碰撞对象在一个坐标系中
        let t = node._sgNode.getNodeToParentTransform(parentCollision.node.parent._sgNode);

        let rect = cc.rect(minX, minY, node.width, node.height);

        let wp0 = cc.v2();
        let wp1 = cc.v2();
        let wp2 = cc.v2();
        let wp3 = cc.v2();
        
        cc.obbApplyAffineTransform(rect, t, wp0, wp1, wp2, wp3);

        let minXT = Math.min(wp0.x, wp1.x, wp2.x, wp3.x);
        let maxXT = Math.max(wp0.x, wp1.x, wp2.x, wp3.x);
        let minYT = Math.min(wp0.y, wp1.y, wp2.y, wp3.y); 
        let maxYT = Math.max(wp0.y, wp1.y, wp2.y, wp3.y);
        
        return {
            minX: minXT,
            maxX: maxXT,
            minY: minYT,
            maxY: maxYT
        }
    }

    /**
     * 碰撞回调
     * @param 其他碰撞对象
     */ 
    onCollisionBy(otherCollision: ObjCollision) {
        this.otherCollisionsInFrame.push(otherCollision);
    }

    reset() {
        this.otherCollisionsInFrame = [];
    }
}
