// EnemyCtrlr.ts
// 敌人控制器
// lly 2018.6.27

const {ccclass, property} = cc._decorator;

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
export default class EnemyCtrlr extends cc.Component {

    /** 敌人名称对应的节点的对象池 */
    pool: {[key: string]: Enemy[];} = {};

    /** 资源名称对应的资源 */
    prefabs: {[key: string]: cc.Prefab;}[] = [];
    prefabNames: string[][] = [];

    /** 每个区域的水罐位置 */
    datas: EnemyData[][] = [];

    curScene: number = 1; //从1开始
    curArea: number = 1; //从1开始

    setSceneAndLoadRes(sceneIndex: number, finishCallback: () => void) {
        this.curScene = sceneIndex;
        if (this.prefabs[sceneIndex]) return;

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir(`enemy/scene${sceneIndex}`, cc.Prefab, (error: Error, prefabs: cc.Prefab[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load enemy prefab res dir: ${error.message}`);
                return;
            }
           
            let data = {};
            let names = [];
            for (const prefab of prefabs) {
                data[prefab.name] = prefab;
                names.push(prefab.name);
            }
            
            this.prefabs[sceneIndex] = data;
            this.prefabNames[sceneIndex] = names;

            finishCallback();
        });
    }

    setData(areaIndex: number, poss: {pos: cc.Vec2, ground: GroundInfo}[]) {
        let data: EnemyData[] = [];
        let names = this.prefabNames[this.curScene];
        let len = names.length;
        for (const pos of poss) {
            let r = Math.random() * len;
            let k = Math.floor(r);

            let name = names[k];
            data.push(new EnemyData(pos.pos, name, 1));
        }
        this.datas[areaIndex] = data;

        // 预生成节点
        let counts = {};
        for (const enemyData of data) {
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
            if (len > 0) {
                let prefab = prefabs[name];
                for (let index = 0; index < len; index++) {
                    let node = cc.instantiate(prefab);
                    parent.addChild(node);

                    let enemy = node.getComponent(Enemy);
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
                    enemy.node.active = false;
                }
            } else {
                for (let i = 1 + index; i < enemys.length; i++){
                    const enemy = enemys[i];
                    enemy.node.active = false;
                }
            }
        }
    }

    killEnemy(enemy: Enemy) {
        let index = enemy.ctrlrIndex;
        if (index) {
            this.datas[this.curArea][index].living = false;
            enemy.node.active = false;
        } else { // 没有index说明不是从pool中生成的
            enemy.node.removeFromParent();
        } 
    }
}
