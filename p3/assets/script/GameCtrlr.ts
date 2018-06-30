// GameCtrlr.ts
// 游戏控制器，负责一些游戏的整体控制，切换地图
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import {MapCtrlr, GroundInfo} from "./MapCtrlr";
import {TerrainCtrlr} from "./TerrainCtrlr";
import {Hero} from "./Hero";

import EnemyCtrlr from "./EnemyCtrlr";
import PotCtrlr from "./PotCtrlr";

import ItemCtrlr from "./ItemCtrlr";
import Curtain from "./Curtain";


@ccclass
export default class GameCtrlr extends cc.Component {

    @property(MapCtrlr)
    mapCtrlr: MapCtrlr = null;

    @property(TerrainCtrlr)
    terrainCtrlr: TerrainCtrlr = null;

    @property(Hero)
    hero: Hero = null;

    @property(EnemyCtrlr)
    enemyCtrlr: EnemyCtrlr = null;

    @property(PotCtrlr)
    potCtrlr: PotCtrlr = null;

    @property(ItemCtrlr)
    itemCtrlr: ItemCtrlr = null;

    @property(Curtain)
    curtain: Curtain = null;

    curScene: number = 1; // 从1开始

    start() {
        this.changeScene(1);
    }

    changeScene(index: number) {
        this.curScene = index;
        callList(this, [
            [this._createScene],
            [this._loadEnemyRes],
            [this._loadPotRes],
            [this._createEnemyAndPot],
            [this._gotoHeroSpot],
            [this._showScene]
        ]);
    }

    _createScene(callNext: () => void, lastData: any) {
        this.mapCtrlr.createScene(this.curScene, () => {
            callNext();
        });
    }

    _loadEnemyRes(callNext: () => void, lastData: any) {
        this.enemyCtrlr.setSceneAndLoadRes(this.curScene, callNext);
    }

    _loadPotRes(callNext: () => void, lastData: any) {
        this.potCtrlr.setSceneAndLoadRes(this.curScene, callNext);
    }

    _createEnemyAndPot(callNext: () => void, lastData: any) {
        let len = this.mapCtrlr.getAreaCount();
        for (let index = 1; index <= len; index++) {
            let poss: {pos: cc.Vec2, ground: GroundInfo}[];
            poss = this.mapCtrlr.createRandomGroundPoss(index);
            this.enemyCtrlr.setData(index, poss);

            poss = this.mapCtrlr.createRandomGroundPoss(index);
            this.potCtrlr.setData(index, poss);
        }
        callNext();
    }

    _gotoHeroSpot(callNext: () => void, lastData: any) {
        let {area, x, y} = this.mapCtrlr.getHeroPos();
        this._changeArea(area, x, y);
        callNext();
    }

    _showScene(callNext: () => void, lastData: any) {
        this.curtain.showScene();
    }

    enterGate(gateGid: number, lastHeroPos: cc.Vec2) {
        let {thisX, thisY, otherArea, otherX, otherY} = this.mapCtrlr.getGatePos(gateGid);
        let lastGatePos = this.terrainCtrlr.getPosFromTilePos(thisX, thisY);
        let diff = cc.pSub(lastHeroPos, lastGatePos);
        this._changeArea(otherArea, otherX, otherY, diff.x, diff.y);
    }

    _changeArea(areaIndex: number, x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        this.mapCtrlr.changeArea(areaIndex);

        this.potCtrlr.changeArea(areaIndex);
        this.itemCtrlr.clear();

        let heroPos = this.terrainCtrlr.getPosFromTilePos(x, y);
        this.hero.movableObj.blink(heroPos.x + offsetX, heroPos.y + offsetY);
    }
}
