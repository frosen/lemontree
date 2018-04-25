// ObjCollider.ts
// 对象碰撞
// 对象碰撞就是英雄，敌人以及相应武器法术之间的碰撞
// lly 2018.1.13

const {ccclass, property, executeInEditMode} = cc._decorator;

export class CollisionData {
    cldr: ObjCollider = null;
    minX: number = 0;
    maxX: number = 0;
    minY: number = 0;
    maxY: number = 0;
}

@ccclass
@executeInEditMode
export class ObjCollider extends cc.Component {

    /** 回调函数 */
    callback: (collisionDatas: CollisionData[])=>void = null;

    /** 碰撞范围 为空的话则使用node的size*/
    @property(cc.Size)
    size: cc.Size = cc.size(0, 0);

    /** 碰撞范围偏移量 */
    @property(cc.Vec2)
    offset: cc.Vec2 = cc.v2(0, 0);

    /** 以此对象为父对象的次级碰撞对象的列表，次级碰撞对象需要额外计算位置 */
    @property([ObjCollider])
    subColliders: ObjCollider[] = [];

    /** 运行时显示范围，便于测试 */
    @property
    showingInRunning: boolean = false;
    
    /** 当前帧中，此碰撞对象碰触到的其他碰撞对象的列表 */
    collisionDatas: CollisionData[] = [];

    // 这里的update主要用于在编辑器中显示其碰撞范围
    _debugDrawer: _ccsg.GraphicsNode = null;
    _debugColor: cc.Color = cc.Color.WHITE;
    update(_: number) {
        if (CC_EDITOR || this.showingInRunning) {
            if (!this._debugDrawer) {
                this._debugDrawer = new _ccsg.GraphicsNode();
                this.node._sgNode.addChild(this._debugDrawer, 99999);
                this._debugDrawer.strokeColor = this._debugColor;
            }

            let node = this.node;
            let w = this.size.width > 0 ? this.size.width : node.width;
            let h = this.size.height > 0 ? this.size.height : node.height;

            let minX = -w * node.anchorX + this.offset.x;
            let maxX = minX + w;
            let minY = -h * node.anchorY + this.offset.y;
            let maxY = minY + h;

            this._debugDrawer.clear();
            this._debugDrawer.moveTo(minX, minY);

            this._debugDrawer.lineTo(minX, maxY);
            this._debugDrawer.lineTo(maxX, maxY);
            this._debugDrawer.lineTo(maxX, minY);
            this._debugDrawer.lineTo(minX, minY);

            this._debugDrawer.close();
            this._debugDrawer.stroke();             
        }
    }

    /**
     * 获取最大最小x，y
     * @param 父碰撞对象，只有次级碰撞对象有，默认为空
     * @returns 获取最大最小x，y
     */        
    getMaxMinXY(parentCollider: ObjCollider = null): {minX: number, maxX: number, minY: number, maxY: number} {
        
        let node = this.node;
        let w = this.size.width > 0 ? this.size.width : node.width;
        let h = this.size.height > 0 ? this.size.height : node.height;

        let minX = -w * node.anchorX + this.offset.x;
        let maxX = minX + w;
        let minY = -h * node.anchorY + this.offset.y;
        let maxY = minY + h;

        if (!parentCollider) {
            return {
                minX: minX + node.x,
                maxX: maxX + node.x,
                minY: minY + node.y,
                maxY: maxY + node.y
            };
        }

        // 转换到父碰撞对象的父节点的坐标中，可以让其和父碰撞对象在一个坐标系中
        let t = node._sgNode.getNodeToParentTransform(parentCollider.node.parent._sgNode);

        let rect = cc.rect(minX, minY, w, h);

        let wp0 = cc.v2();
        let wp1 = cc.v2();
        let wp2 = cc.v2();
        let wp3 = cc.v2();
        
        cc.obbApplyAffineTransform(rect, t, wp0, wp1, wp2, wp3);

        minX = Math.min(wp0.x, wp1.x, wp2.x, wp3.x);
        maxX = Math.max(wp0.x, wp1.x, wp2.x, wp3.x);
        minY = Math.min(wp0.y, wp1.y, wp2.y, wp3.y); 
        maxY = Math.max(wp0.y, wp1.y, wp2.y, wp3.y);
        
        return {minX, maxX, minY, maxY};
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
        if (this.callback) this.callback(this.collisionDatas);
    }

    /**
     * 重置碰撞数据，在刷新数据之前执行
     */
    reset() {
        this.collisionDatas = [];
    }
}
