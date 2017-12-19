// TerrainManager.ts
// 地形管理器：
// 控制tiledmap
// lly 2017.12.18

const {ccclass, property} = cc._decorator;

/** 一个瓦片的标准长度 */
const TileLength: number = 32;

@ccclass
export default class TerrainManager extends cc.Component {

    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;

    /** 地形尺寸 */
    terrainSize: cc.Size = null;
    /** 碰撞检测层 */
    collidableLayer: cc.TiledLayer = null;

    onLoad() {
        // init logic
        let tileNumSize: cc.Size = this.tiledMap.getMapSize();
        this.terrainSize = new cc.Size(tileNumSize.width * TileLength, tileNumSize.height * TileLength);
        this.collidableLayer = this.tiledMap.getLayer("collision");
    }

    /**
     * 检测当前creator坐标在当前tiledMap中是否为一个碰撞区块
     * @param x: x坐标
     * @param y: y坐标
     * @return 0是无碰撞，1是碰撞块，2是只从上往下有碰撞
     */
    checkCollideAt(x: number, y: number): number {
        
        let tileX = Math.floor(x / TileLength);
        let tileY = Math.floor((this.terrainSize.height - y - 1) / TileLength); // tiledmap与creator的y轴相反

        if (tileX < 0 || this.terrainSize.width - 1 < tileX || tileY < 0 || this.terrainSize.height - 1 < tileY) {
            return 0; // 超出范围无碰撞
        }

        let gid = this.collidableLayer.getTileGIDAt(tileX, tileY);
        if (!gid) return 0; // 没有瓦片

        let properties = this.tiledMap.getPropertiesForGID(gid);
        if (!properties) return 0; // null 没有属性

        let collidable: number = parseInt(properties.collidable)
        if (collidable != 1 && collidable != 2) {
            cc.error("!!! wrong collidable. only 1 or 2.", tileX, tileY);
        }
        
        return collidable;
    }


}
