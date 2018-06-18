// GameCtrlr.ts
// 游戏控制器，负责一些游戏的整体控制，切换地图
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import MapCtrlr from "./MapCtrlr";
import {TerrainCtrlr} from "./TerrainCtrlr";
import {Hero} from "./Hero";
import Curtain from "./Curtain";

@ccclass
export default class GameCtrlr extends cc.Component {

    @property(MapCtrlr)
    mapCtrlr: MapCtrlr = null;

    @property(TerrainCtrlr)
    terrainCtrlr: TerrainCtrlr = null;

    @property(Hero)
    hero: Hero = null;

    @property(Curtain)
    curtain: Curtain = null;

    start () {
        this.changeScene(1);
    }

    changeScene(index: number) {
        callList(this, [
            [(callNext: () => void, lastData: any) => { // 生成新场景
                this.mapCtrlr.createScene(index, () => {
                    callNext();
                });
            }],
            [(callNext: () => void, lastData: any) => { // 切换到英雄初始位置
                let {area, x, y} = this.mapCtrlr.getHeroPos();
                this._changeArea(area, x, y);
                callNext();
            }],
            [(callNext: () => void, lastData: any) => { // 拉开帷幕
                this.curtain.showScene();
            }]
        ]);
    }

    enterGate(gateGid: number, lastHeroPos: cc.Vec2) {
        let {thisArea, thisX, thisY, otherArea, otherX, otherY} = this.mapCtrlr.getGatePos(gateGid);
        let lastGatePos = this.terrainCtrlr.getPosFromTilePos(thisX, thisY);
        let diff = cc.pSub(lastHeroPos, lastGatePos);
        this._changeArea(otherArea, otherX, otherY, diff.x, diff.y);
    }

    _changeArea(areaIndex: number, x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        this.mapCtrlr.changeArea(areaIndex);

        let clsnData = this.mapCtrlr.getAreaCollisionData(areaIndex);
        this.terrainCtrlr.setTerrainData(clsnData);
        
        let heroPos = this.terrainCtrlr.getPosFromTilePos(x, y);
        this.hero.movableObj.blink(heroPos.x + offsetX, heroPos.y + offsetY);
    }


}
