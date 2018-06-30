// EnemyCtrlr.ts
// 敌人控制器
// lly 2018.6.27

const {ccclass, property} = cc._decorator;

import {GroundInfo} from "./MapCtrlr";

class EnemyData {
    pos: cc.Vec2;
}

@ccclass
export default class EnemyCtrlr extends cc.Component {

    /** 资源名称对应的资源 */
    prefabs: cc.Prefab[][] = [];

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
            
            this.prefabs[sceneIndex] = prefabs;
            finishCallback();
        });
    }

    setData(areaIndex: number, poss: {pos: cc.Vec2, ground: GroundInfo}[]) {
        let data = [];
        let prefabs = this.prefabs[this.curScene];
        let len = prefabs.length;
        for (const pos of poss) {
            let r = Math.random() * len;
            let k = Math.floor(r);

            let prefab = prefabs[k];
            let name = prefab.name;


            data.push(new PotData(pos, potInfos[k]));
        }
        this.potDatas[areaIndex] = data;
    }
}
