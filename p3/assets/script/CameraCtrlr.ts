// CameraCtrlr.ts
// 镜头控制器
// lly 2017.12.30

const { ccclass, property, executionOrder } = cc._decorator;

import MyComponent from './MyComponent';
import { TerrainCtrlr } from './TerrainCtrlr';

@ccclass
@executionOrder(EXECUTION_ORDER.CameraCtrlr)
export default class CameraCtrlr extends MyComponent {
    @property(cc.Camera)
    camera: cc.Camera = null;

    @property(cc.Node)
    target: cc.Node = null;

    @property(TerrainCtrlr)
    map: TerrainCtrlr = null;

    mapSize: cc.Size = cc.size(0, 0);

    xMin: number = null;
    xMax: number = null;
    yMin: number = null;
    yMax: number = null;

    /** 相对于主角位置的偏差，用于视野移动 */
    offset: cc.Vec2 = cc.v2(0, 0);

    update(_: number) {
        // 设置镜头的移动范围
        let newMapSize = this.map.terrainSize;
        if (newMapSize.width != this.mapSize.width || newMapSize.height != this.mapSize.height) {
            this.mapSize = newMapSize;

            let canvas: cc.Node = cc.find('canvas');
            let viewSize = canvas.getContentSize();

            let rate = 0.5;
            this.xMin = viewSize.width * rate;
            this.xMax = this.mapSize.width - viewSize.width * rate;
            this.yMin = viewSize.height * rate;
            this.yMax = this.mapSize.height - viewSize.height * rate;
        }

        // 计算位置
        let targetPos = this.target.parent.convertToWorldSpaceAR(this.target.position);
        let cameraPos = this.node.parent.convertToNodeSpaceAR(targetPos);

        cameraPos.addSelf(this.offset);

        cameraPos.x = Math.min(Math.max(cameraPos.x, this.xMin), this.xMax);
        cameraPos.y = Math.min(Math.max(cameraPos.y, this.yMin), this.yMax);

        this.node.position = cameraPos;
    }
}
