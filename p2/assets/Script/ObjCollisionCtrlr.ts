// ObjCollisionCtrlr.ts
// 对象碰撞控制器
// 效率高于BoxCollider
// lly 2018.1.13

const {ccclass, property, executionOrder} = cc._decorator;

import {ObjCollision, CollisionData} from "./ObjCollision";

/** 检测容器最大容量 */
const CollisionDataMaxLength: number = 1000;

@ccclass
@executionOrder(EXECUTION_ORDER.ObjCollision) // 在地形碰撞后在检测
export default class ObjCollisionCtrlr extends cc.Component {

    /** 被检测的层 */
    @property([cc.Node])
    checkedLayers: cc.Node[] = [];

    /** 检测策略文本 */
    @property
    checkingTacticsString: string = "";
    /** 检测策略 */
    checkingTactics: number[][] = [];

    /** 检测数据容器，为了提高效率，减少object生成和销毁，使用一个固定大小的容器，改变其数据而不进行随意的创建销毁 */
    collisionDatas: CollisionData[][] = [];
    /** 检测数据容器的当前大小 */
    collisionDataLengths: number[] = [];

    onLoad() {
        // 根据string 生成策略
        let strs: string[] = this.checkingTacticsString.split(";");
        for (const str of strs) {
            let layerIdStrs: string[] = str.split("-");

            let layerId1 = Number(layerIdStrs[0]);
            let layerId2 = Number(layerIdStrs[1]);

            cc.assert(typeof(layerId1) == "number" && typeof(layerId2) == "number", "layer id must be number");
            cc.assert(0 <= layerId1 && layerId1 < this.checkedLayers.length, "layer id 1 wrong");
            cc.assert(0 <= layerId2 && layerId2 < this.checkedLayers.length, "layer id 2 wrong");
            
            this.checkingTactics.push([layerId1, layerId2]);
        }

        // 根据被检测层生成检测数据的容器
        for (let index = 0; index < this.checkedLayers.length; ++index) {
            let data: {clsn: ObjCollision, minX: number, maxX: number, minY: number, maxY: number}[] = [];
            for (let j = 0; j < CollisionDataMaxLength; ++j) {
                data[j] = {clsn: null, minX: 0, maxX: 0, minY: 0, maxY: 0}               
            }
            this.collisionDatas[index] = data;
            this.collisionDataLengths[index] = 0;
        }
    }

    update(dt: number) {
        this.createCollsionData();
        this.checkByTictics();
        this.excuteCollisionCallback();
    }

    /** 遍历检测层，获取相关控件的数据 */
    createCollsionData() {
        for (let i = 0; i < this.checkedLayers.length; ++i) {
            this.collisionDataLengths[i] = 0; // 重置数据

            let layer = this.checkedLayers[i];
            let children: cc.Node[] = layer.children;
            for (const child of children) {
                let collision: ObjCollision = child.getComponent(ObjCollision);
                if (!collision) continue;

                if (!collision.hide) this.saveCollsionDataAndResetObj(collision, null, i);

                for (const subCollision of collision.subCollisions) {
                    if (!subCollision.hide) this.saveCollsionDataAndResetObj(subCollision, collision, i);
                }
            }
        }
    }

    saveCollsionDataAndResetObj(collision: ObjCollision, parentCollsion: ObjCollision, i: number) {
        let {minX, maxX, minY, maxY}= collision.getMaxMinXY(parentCollsion);
        let data = this.collisionDatas[i][this.collisionDataLengths[i]];
        data.clsn = collision;
        data.minX = minX;
        data.maxX = maxX;
        data.minY = minY;
        data.maxY = maxY;

        ++this.collisionDataLengths[i];

        collision.reset(); // 重置数据
    }

    /** 根据策略，检测碰撞 */
    checkByTictics() {
        for (const checkingIndexs of this.checkingTactics) {
            let index0 = checkingIndexs[0];
            let index1 = checkingIndexs[1];
            this.check(this.collisionDatas[index0], this.collisionDataLengths[index0], 
                this.collisionDatas[index1], this.collisionDataLengths[index1]);
        }
    }

    check(datas1: CollisionData[], length1: number, datas2: CollisionData[], length2: number) {
        for (let index1 = 0; index1 < length1; ++index1) {
            const d1 = datas1[index1];
            for (let index2 = 0; index2 < length2; ++index2) {
                const d2 = datas2[index2];
                if (d1.maxX >= d2.minX && d1.minX <= d2.maxX && d1.maxY >= d2.minY && d1.minY <= d2.maxY) {
                    d1.clsn.onCollisionBy(d2);
                    d2.clsn.onCollisionBy(d1);
                }
            }
        }
    }

    excuteCollisionCallback() {
        for (let i = 0; i < this.collisionDatas.length; i++) {
            const dataList = this.collisionDatas[i];
            const l = this.collisionDataLengths[i];
            for (let j = 0; j < l; j++) {
                const data = dataList[j];
                data.clsn.excuteCallback();               
            }           
        }
    }
}
