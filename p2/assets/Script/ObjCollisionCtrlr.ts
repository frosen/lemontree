// ObjCollisionCtrlr.ts
// 对象碰撞控制器
// 效率高于BoxCollider
// lly 2018.1.13

const {ccclass, property, executionOrder} = cc._decorator;

import ObjCollision from "./ObjCollision";

const CollisionDataMaxLength: number = 1000;

@ccclass
@executionOrder(EXECUTION_ORDER.ObjCollision) // 在地形碰撞后在检测
export default class ObjCollisionCtrlr extends cc.Component {

    /** 被检测的层 */
    @property([cc.Node])
    checkedLayers: cc.Node[] = [];

    /** 检测策略 */
    @property
    checkingTacticsString: string = "";

    checkingTactics: number[][] = [];

    collisionDatas: {clsn: ObjCollision, minX: number, maxX: number, minY: number, maxY: number}[][] = [];
    
    collisionDataLengths: number[] = [];

    onLoad() {
        // 根据string 生成策略
        let strs: string[] = this.checkingTacticsString.split(";");
        for (const str of strs) {
            let layerIdStrs: string[] = str.split("-");

            let layerId1 = Number(layerIdStrs[0]);
            let layerId2 = Number(layerIdStrs[1]);

            if(typeof(layerId1) == "number" && typeof(layerId2) == "number" &&
                layerId1 < this.checkedLayers.length && layerId2 < this.checkedLayers.length &&
                layerId1 >= 0 && layerId2 >= 0) {
                    cc.log("ObjCollisionCtrlr init suc");
                } else {
                    cc.error("ObjCollisionCtrlr init error");
                }
            
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
    }

    createCollsionData() {
        for (let i = 0; i < this.checkedLayers.length; ++i) {
            this.collisionDataLengths[i] = 0; // 重置数据

            let layer = this.checkedLayers[i];
            let children: cc.Node[] = layer.children;
            for (const child of children) {
                let collision: ObjCollision = child.getComponent(ObjCollision);
                if (!collision) continue;

                if (!collision.hide) this.saveCollsionData(collision, null, i);

                for (const subCollision of collision.subCollisions) {
                    if (!subCollision.hide) this.saveCollsionData(subCollision, collision, i);
                }
            }
        }
    }

    saveCollsionData(collision: ObjCollision, parentCollsion: ObjCollision, i: number) {
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

    checkByTictics() {
        for (const checkingIndexs of this.checkingTactics) {
            let index0 = checkingIndexs[0];
            let index1 = checkingIndexs[1];
            this.check(this.collisionDatas[index0], this.collisionDataLengths[index0], 
                this.collisionDatas[index1], this.collisionDataLengths[index1]);
        }
    }

    check(datas1: {clsn: ObjCollision, minX: number, maxX: number, minY: number, maxY: number}[], length1: number,
        datas2: {clsn: ObjCollision, minX: number, maxX: number, minY: number, maxY: number}[], length2: number) {
            for (let index1 = 0; index1 < length1; ++index1) {
                const d1 = datas1[index1];
                for (let index2 = 0; index2 < length2; ++index2) {
                    const d2 = datas2[index2];
                    if (d1.maxX >= d2.minX && d1.minX <= d2.maxX && d1.maxY >= d2.minY && d1.minY <= d2.maxY) {
                        this.onCollision(d1.clsn, d2.clsn);
                    }
                }
            }
        }

    onCollision(clsn1: ObjCollision, clsn2: ObjCollision) {
        clsn1.onCollisionBy(clsn2);
        clsn2.onCollisionBy(clsn1);
    }
}
