// Collision.ts
// 碰撞组件
// 拥有此组件的单位会进行碰撞检测
// lly 2017.12.12

const {ccclass, property, executionOrder} = cc._decorator;

/** 与地形的碰撞 */
import TerrainManager from './TerrainManager'; 

@ccclass
@executionOrder(EXECUTION_ORDER.Collision)
export default class Collision extends cc.Component {

    /** 地图的碰撞检测 */
    terrainMgr: TerrainManager = null;

    onLoad() {
        this.terrainMgr = cc.director.getScene().getComponentInChildren(TerrainManager);
        cc.log("xxx", this.terrainMgr.name);
    }



}