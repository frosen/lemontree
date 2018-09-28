// SpineCtrlr.ts
// 尖刺陷阱控制器
// lly 2018.8.27

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import Spine from "./Spine";

class SpineData {
    pos: cc.Vec2;
    name: string;

    constructor(pos: cc.Vec2, name: string) {
        this.pos = pos;
        this.name = name;
    }
}

@ccclass
export default class SpineCtrlr extends MyComponent {

    /** 敌人名称对应的节点的对象池 */
    pool: {[key: string]: Spine[];} = {};

    /** 敌人资源名称对应的资源 */
    prefabs: {[key: string]: cc.Prefab;}[] = [];

    /** 每个区域的尖刺位置信息 */
    datas: SpineData[][] = [];

    curScene: number = 1; //从1开始
    curArea: number = 1; //从1开始

    setSceneAndLoadRes(sceneIndex: number, finishCallback: () => void) {
        this.curScene = sceneIndex;
        if (this.prefabs[sceneIndex]) return finishCallback();

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir(`map/scene${this.curScene}/spine`, cc.Prefab, (error: Error, prefabs: cc.Prefab[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load spine prefab res dir: ${error.message}`);
                return;
            }

            cc.assert(prefabs.length > 0, "Wrong size of spine prefab");

            let data = {};
            for (const prefab of prefabs) {
                data[prefab.name] = prefab;
            }

            this.prefabs[this.curScene] = data;

            return finishCallback();

            console.log
        });
    }

    getSpineNameFromId(id: number): string {
        return "spine";
    }

    setData(areaIndex: number, infos: {x: number, y: number, spineId: number}[]) {
        let datas: SpineData[] = [];
        for (const info of infos) {
            let name = this.getSpineNameFromId(info.spineId);
            datas.push(new SpineData(cc.v2(info.x, info.y), name));
        }
        this.datas[areaIndex] = datas;

        // 预生成节点
        let counts = {};
        for (const spineData of datas) { // 每种类型敌人的数量
            let name = spineData.name;
            if (!counts[name]) {
                counts[name] = 1;
            } else {
                counts[name] += 1;
            }
        }

        let prefabs = this.prefabs[this.curScene];
        let parent = this.node;
        for (const name in counts) {
            const count = counts[name];
            let nodes = this.pool[name];
            if (!nodes) {
                this.pool[name] = [];
                nodes = this.pool[name];
            }
            let len = count - nodes.length;
            if (len > 0) { // 当前场景中敌人数量，大于容器中已有的数量，所以生成新的
                let prefab = prefabs[name];
                for (let index = 0; index < len; index++) {
                    let node = cc.instantiate(prefab);
                    parent.addChild(node);
                    let spine = node.getComponent(Spine);
                    nodes.push(spine);
                    node.active = false;
                }
            }
        }
    }

    changeArea(areaIndex: number) {
        this.curArea = areaIndex;
        let datas: SpineData[] = this.datas[areaIndex];
        if (!datas) return;

        let poolIndexs = {};

        for (const data of datas) {
            let name = data.name;

            let index = poolIndexs[name];
            if (index == undefined) {
                index = 0;
            } else {
                index++;
            }
            poolIndexs[name] = index;

            let spine: Spine = this.pool[name][index];
            spine.reset();

            let node = spine.node;
            node.active = true;
            node.setPosition(data.pos);
        }

        // 隐藏不用的节点
        for (const name in this.pool) {
            const spines: Spine[] = this.pool[name];
            let index = poolIndexs[name];
            if (index == undefined) { // 全都没用到，全隐藏
                for (const spine of spines) {
                    spine.node.active = false;
                }
            } else {
                for (let i = 1 + index; i < spines.length; i++){
                    const spine = spines[i];
                    spine.node.active = false;
                }
            }
        }
    }
}