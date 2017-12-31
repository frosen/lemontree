// CameraController.ts
// 镜头控制器
// lly 2017.12.30

const {ccclass, property, executionOrder} = cc._decorator;

@ccclass
@executionOrder(EXECUTION_ORDER.CameraController)
export default class CameraController extends cc.Component {

    @property(cc.Camera)
    camera: cc.Camera = null;

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.Node)
    map: cc.Node = null;

    xMin: number = null;
    xMax: number = null;
    yMin: number = null;
    yMax: number = null;

    onLoad() {
        // 设置镜头的移动范围
        let canvas: cc.Node = cc.find('canvas');
        let viewSize = canvas.getContentSize();

        let mapSize = this.map.getContentSize();

        let rate = 0.25
        this.xMin = viewSize.width * rate;
        this.xMax = mapSize.width - viewSize.width * rate;
        this.yMin = viewSize.height * rate;
        this.yMax = mapSize.height - viewSize.height * rate;
    }

    onEnable() {
        cc.director.getPhysicsManager().attachDebugDrawToCamera(this.camera);
    }

    onDisable() {
        cc.director.getPhysicsManager().detachDebugDrawFromCamera(this.camera);
    }

    update() {
        let targetPos = this.target.parent.convertToWorldSpaceAR(this.target.position);
        let cameraPos = this.node.parent.convertToNodeSpaceAR(targetPos);

        cameraPos.x = Math.min(Math.max(cameraPos.x, this.xMin), this.xMax);
        cameraPos.y = Math.min(Math.max(cameraPos.y, this.yMin), this.yMax);
        
        this.node.position = cameraPos;
    }
}
