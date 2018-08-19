// GameCtrlr.ts
// 游戏控制器，负责一些游戏的整体控制，切换地图
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import {MapCtrlr, GroundInfo} from "./MapCtrlr";
import {TerrainCtrlr} from "./TerrainCtrlr";
import {Hero} from "./Hero";

import EnemyCtrlr from "./EnemyCtrlr";
import SpineCtrlr from "./SpineCtrlr";
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

    @property(SpineCtrlr)
    spineCtrlr: SpineCtrlr = null;

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
            [this._loadSpineRes],
            [this._loadPotRes],
            [this._createObjs],
            [this._gotoHeroSpot],
            [this._showScene]
        ]);
    }

    _createScene(callNext: () => void, lastData: any) {
        this.mapCtrlr.createScene(this.curScene, () => {
            return callNext();
        });
    }

    _loadEnemyRes(callNext: () => void, lastData: any) {
        this.enemyCtrlr.setSceneAndLoadRes(this.curScene, callNext);
    }

    _loadSpineRes(callNext: () => void, lastData: any) {
        this.spineCtrlr.setSceneAndLoadRes(this.curScene, callNext);
    }

    _loadPotRes(callNext: () => void, lastData: any) {
        this.potCtrlr.setSceneAndLoadRes(this.curScene, callNext);
    }

    _createObjs(callNext: () => void, lastData: any) {
        let len = this.mapCtrlr.getAreaCount();
        for (let index = 1; index <= len; index++) {
            // 生成机关陷阱
            let spineInfo = this.mapCtrlr.getSpineInfo(index);
            this.spineCtrlr.setData(index, spineInfo);

            // 生成敌人
            let posInfos: {pos: cc.Vec2, ground: GroundInfo}[];
            posInfos = this.mapCtrlr.createRandomGroundPoss(index);
            this.enemyCtrlr.setData(index, posInfos);

            // 生成pot
            posInfos = this.mapCtrlr.createRandomGroundPoss(index);
            this.potCtrlr.setData(index, posInfos);
        }
        return callNext();
    }

    _gotoHeroSpot(callNext: () => void, lastData: any) {
        let {area, x, y} = this.mapCtrlr.getHeroPos();
        this._changeArea(area, x, y);
        return callNext();
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

        this.enemyCtrlr.changeArea(areaIndex);
        this.spineCtrlr.changeArea(areaIndex);
        this.potCtrlr.changeArea(areaIndex);
        this.itemCtrlr.clear();

        let heroPos = this.terrainCtrlr.getPosFromTilePos(x, y);
        this.hero.movableObj.blink(heroPos.x + offsetX, heroPos.y + offsetY);

        this.hero.onChangeArea();
    }

    /** 暂停游戏 */
    pause() {
        
    }
}
