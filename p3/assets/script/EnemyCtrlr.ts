// EnemyCtrlr.ts
// 敌人控制器
// lly 2018.6.27

const { ccclass, property } = cc._decorator;

import MyComponent from './MyComponent';
import { GameCtrlr } from './GameCtrlr';
import Enemy from './Enemy';
import { GroundInfo } from './MapCtrlr';

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

    gameCtrlr: GameCtrlr = null;

    /** 敌人名称对应的节点的对象池 */
    pool: { [key: string]: Enemy[] } = {};

    /** 敌人资源名称对应的资源 */
    prefabs: { [key: string]: cc.Prefab }[] = [];
    /** 敌人名称列表 */
    prefabNames: string[][] = [];
    /** 高级敌人名称列表 */
    adPrefabNames: string[][] = [];

    /** 每个区域的敌人位置信息 */
    datas: EnemyData[][] = [];

    onLoad() {
        this.gameCtrlr = cc.find('main').getComponent(GameCtrlr);
    }

    start() {
        // 在enemy的onload后
        if (this.debugEnemyLevel > 0) {
            for (const child of this.node.children) {
                let enemy: Enemy = child.getComponent(Enemy);
                enemy.reset(null, this.debugEnemyLevel);
            }
        }
    }

    setSceneAndLoadRes(finishCallback: () => void) {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        if (this.prefabs[curSceneIndex]) return finishCallback();

        // 异步加载道具纹理，生成列表
        cc.loader.loadResDir(
            `map/scene${curSceneIndex}/enemy`,
            cc.Prefab,
            (error: Error, prefabs: cc.Prefab[], urls: string[]) => {
                if (error) {
                    cc.log(`Wrong in load enemy prefab res dir: ${error.message}`);
                    return;
                }

                cc.assert(prefabs.length > 0, 'Wrong size of enemy prefab');

                let data = {};
                let adNames = [];
                let names = [];
                for (const prefab of prefabs) {
                    data[prefab.name] = prefab;
                    if (prefab.name.substring(prefab.name.length - 3, prefab.name.length) == '_ad') {
                        // lly todo 还未测试
                        adNames.push(prefab.name); // 高级敌人，只能在高级场景出现
                    } else {
                        names.push(prefab.name);
                    }
                }

                this.prefabs[curSceneIndex] = data;
                this.prefabNames[curSceneIndex] = names;
                this.adPrefabNames[curSceneIndex] = adNames;

                return finishCallback();
            },
        );
    }

    setData(areaIndex: number, advance: boolean, groundInfos: GroundInfo[]) {
        if (this.debugEnemyLevel > 0) return; // 开启测试，就不随机生成了

        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let data: EnemyData[] = [];

        if (advance) {
            let names = this.prefabNames[curSceneIndex];
            let adNames = this.adPrefabNames[curSceneIndex];
            let len = names.length;
            let allLen = len + adNames.length;
            for (const groundInfo of groundInfos) {
                let k = Math.floor(Math.random() * allLen);
                let name = k < len ? names[k] : adNames[k - len];
                data.push(new EnemyData(cc.v2(groundInfo.pX, groundInfo.pY), name, 1));
            }
        } else {
            let names = this.prefabNames[curSceneIndex];
            let len = names.length;
            for (const groundInfo of groundInfos) {
                let k = Math.floor(Math.random() * len);
                let name = names[k];
                data.push(new EnemyData(cc.v2(groundInfo.pX, groundInfo.pY), name, 1));
            }
        }
        this.datas[areaIndex] = data;

        // 预生成节点
        let counts = {};
        for (const enemyData of data) {
            // 每种类型敌人的数量
            let name = enemyData.name;
            if (!counts[name]) {
                counts[name] = 1;
            } else {
                counts[name] += 1;
            }
        }

        let prefabs = this.prefabs[curSceneIndex];
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
                // 当前场景中敌人数量，大于容器中已有的数量，所以生成新的
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

    changeArea() {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        let datas: EnemyData[] = this.datas[curAreaIndex];
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
            if (index == undefined) {
                // 全都没用到，全隐藏
                for (const enemy of enemys) {
                    enemy.onHide();
                    enemy.node.active = false;
                }
            } else {
                for (let i = 1 + index; i < enemys.length; i++) {
                    const enemy = enemys[i];
                    enemy.onHide();
                    enemy.node.active = false;
                }
            }
        }
    }

    killEnemy(enemy: Enemy) {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        let index = enemy.ctrlrIndex;
        if (index != null && index >= 0) {
            this.datas[curAreaIndex][index].living = false;
            enemy.node.active = false;
        } else {
            // 没有index说明不是从pool中生成的
            enemy.node.removeFromParent();
        }
    }

    /**
     * 获取活着的敌人数量
     */
    getLivingEnemyCount(): number {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        let datas = this.datas[curAreaIndex];
        let count: number = 0;
        for (const data of datas) {
            if (data.living) count++;
        }
        return count;
    }
}
