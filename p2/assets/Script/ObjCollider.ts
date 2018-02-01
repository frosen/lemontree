// ObjCollider.ts
// 对象碰撞
// 对象碰撞就是英雄，敌人以及相应武器法术之间的碰撞
// lly 2018.1.13

const {ccclass, property} = cc._decorator;

export class CollisionData {
    cldr: ObjCollider = null;
    minX: number = 0;
    maxX: number = 0;
    minY: number = 0;
    maxY: number = 0;
}

@ccclass
export class ObjCollider extends cc.Component {

    /** 回调函数文本 调用当前节点的某个组件名称:组件的函数名 */
    @property
    callbackStr: string = "";
    /** 回调函数 用文本生成 */
    callback: (collisionDatas: CollisionData[])=>void = null;

    /** 碰撞范围 为空的话则使用node的size*/
    size: cc.Size = null;

    /** 隐藏碰撞 */
    hide: boolean = false;

    /** 以此对象为父对象的次级碰撞对象的列表，次级碰撞对象需要额外计算位置 */
    @property([ObjCollider])
    subColliders: ObjCollider[] = [];
    
    /** 当前帧中，此碰撞对象碰触到的其他碰撞对象的列表 */
    collisionDatas: CollisionData[] = [];

    onLoad() {
        this.callback = getFuncFromString(this, this.callbackStr);
    }

    /**
     * 获取最大最小x，y
     * @param 父碰撞对象，只有次级碰撞对象有，默认为空
     * @returns 获取最大最小x，y
     */        
    getMaxMinXY(parentCollider: ObjCollider = null): {minX: number, maxX: number, minY: number, maxY: number} {
        
        let node = this.node;
        let radius = this.size || node.getContentSize();

        let minX = -radius.width * node.anchorX;
        let maxX = minX + node.width;
        let minY = -radius.height * node.anchorY;
        let maxY = minY + node.height;

        if (!parentCollider) {
            return {
                minX: minX + node.x,
                maxX: maxX + node.x,
                minY: minY + node.y,
                maxY: maxY + node.y
            }
        }

        // 转换到父碰撞对象的父节点的坐标中，可以让其和父碰撞对象在一个坐标系中
        let t = node._sgNode.getNodeToParentTransform(parentCollider.node.parent._sgNode);

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
    onCollisionBy(collisionData: CollisionData) {
        this.collisionDatas.push(collisionData);
    }

    /**
     * 执行碰撞后的回调
     */ 
    excuteCallback() {
        this.callback(this.collisionDatas);
    }

    /**
     * 重置碰撞数据，在刷新数据之前执行
     */
    reset() {
        this.collisionDatas = [];
    }
}
