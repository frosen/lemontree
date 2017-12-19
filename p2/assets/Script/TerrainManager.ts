// TerrainManager.ts
// 地形管理器：
// 控制tiledmap
// lly 2017.12.18

const {ccclass, property} = cc._decorator;

@ccclass
export default class TerrainManager extends cc.Component {

    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;

    /** 碰撞检测层 */
    collidableLayer: cc.TiledLayer = null;

    onLoad() {
        // init logic
        this.collidableLayer = this.tiledMap.getLayer("collision");
    }


}
