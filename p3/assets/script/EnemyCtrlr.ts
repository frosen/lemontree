// EnemyCtrlr.ts
// 敌人控制器
// lly 2018.6.27

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import Enemy from "./Enemy";
import {GroundInfo} from "./MapCtrlr";

class EnemyData {
    pos: cc.Vec2;
    living: boolean;
    name: string;
    lv: number;

    constructor(pos: cc.Vec2, name: string, lv: number) {
        this.pos = pos;
        this.living = true;
        this.name = name;
        this.lv = lv;
    }
}

@ccclass
export default class EnemyCtrlr extends MyComponent {

    /** 测试使用 */
    @property
    debugEnemyLevel: number = 0;

    /** 敌人名称对应的节点的对象池 */
    pool: {[key: string]: Enemy[];} = {};

    /** 敌人资源名称对应的资源 */
    prefabs: {[key: string]: cc.Prefab;}[] = [];
    /** 敌人名称列表 */
    prefabNames: string[][] = [];

    /** 每个区域的敌人位置信息 */
    datas: EnemyData[][] = [];

    curScene: number = 1; //从1开始
    curArea: number = 1; //从1开始

    start() { // 在enemy的onload后
        if (this.debugEnemyLevel > 0) {
            for (const child of this.node.children) {
                let enemy: Enemy = child.getComponent(Enemy);
                enemy.reset(null, this.debugEnemyLevel);
            }
        }
    }

    setSceneAndLoadRes(sceneIndex: number, finishCallback: () => void) {
        this.curScene = sceneIndex;
        if (this.prefabs[sceneIndex]) return finishCallback();

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir(`map/scene${this.curScene}/enemy`, cc.Prefab, (error: Error, prefabs: cc.Prefab[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load enemy prefab res dir: ${error.message}`);
                return;
            }

            cc.assert(prefabs.length > 0, "Wrong size of enemy prefab");

            let data = {};
            let names = [];
            for (const prefab of prefabs) {
                data[prefab.name] = prefab;
                names.push(prefab.name);
            }

            this.prefabs[this.curScene] = data;
            this.prefabNames[this.curScene] = names;

            return finishCallback();
        });
    }

    setData(areaIndex: number, posInfos: {pos: cc.Vec2, ground: GroundInfo}[]) {
        if (this.debugEnemyLevel > 0) return; // 开启测试，就不随机生成了

        let data: EnemyData[] = [];
        let names = this.prefabNames[this.curScene];
        let len = names.length;
        for (const posInfo of posInfos) {
            let r = Math.random() * len;
            let k = Math.floor(r);

            let name = names[k];
            data.push(new EnemyData(posInfo.pos, name, 1));
        }
        this.datas[areaIndex] = data;

        // 预生成节点
        let counts = {};
        for (const enemyData of data) { // 每种类型敌人的数量
            let name = enemyData.name;
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
                    let enemy = node.getComponent(Enemy);
                    enemy.init();
                    nodes.push(enemy);
                    node.active = false;
                }
            }
        }
    }

    changeArea(areaIndex: number) {
        this.curArea = areaIndex;
        let datas: EnemyData[] = this.datas[areaIndex];
        if (!datas) return;

        let dataIndex = 0;
        let poolIndexs = {};

        for (const data of datas) {
            if (!data.living) continue;

            let name = data.name;

            let index = poolIndexs[name];
            if (index == undefined) {
                index = 0;
            } else {
                index++;
            }
            poolIndexs[name] = index;

            let enemy: Enemy = this.pool[name][index];
            enemy.reset(dataIndex, data.lv);

            let node = enemy.node;
            node.active = true;
            node.setPosition(data.pos);

            dataIndex++;
        }

        // 隐藏不用的节点
        for (const name in this.pool) {
            const enemys: Enemy[] = this.pool[name];
            let index = poolIndexs[name];
            if (index == undefined) { // 全都没用到，全隐藏
                for (const enemy of enemys) {
                    enemy.onHide();
                    enemy.node.active = false;
                }
            } else {
                for (let i = 1 + index; i < enemys.length; i++){
                    const enemy = enemys[i];
                    enemy.onHide();
                    enemy.node.active = false;
                }
            }
        }
    }

    killEnemy(enemy: Enemy) {
        let index = enemy.ctrlrIndex;
        if (index != null && index >= 0) {
            this.datas[this.curArea][index].living = false;
            enemy.node.active = false;
        } else { // 没有index说明不是从pool中生成的
            enemy.node.removeFromParent();
        }
    }

    /**
     * 获取活着的敌人数量
     */
    getLivingEnemyCount(): number {
        let datas = this.datas[this.curArea];
        let count: number = 0;
        for (const data of datas) {
            if (data.living) count++;
        }
        return count;
    }
}
