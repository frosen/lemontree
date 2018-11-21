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

import {ItemCtrlr} from "./ItemCtrlr";
import Curtain from "./Curtain";

import MyComponent from "./MyComponent";

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

    gamePause: boolean = false;

    start() { // 所有默认直接onload的之后
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

        if (this.hero) {
            let heroPos = this.terrainCtrlr.getPosFromTilePos(x, y);
            this.hero.movableObj.blink(heroPos.x + offsetX, heroPos.y + offsetY);

            this.hero.onChangeArea();
        }
    }

    /** 暂停游戏 */
    pause() {
        if (this.gamePause) return;
        this.gamePause = true;
        this._pauseChildren(this.node);
    }

    // 遍历当前节点所有子节点，停止其action，animation，停止所有MyComponent下的update
    _pauseChildren(node: cc.Node) {
        let sch = cc.director.getScheduler();
        for (const child of node.children) {
            child.pauseAllActions(); // 除此之外，不应该有pause action的地方

            let anim = child.getComponent(cc.Animation);
            if (anim) {
                anim.pause(); // 除此之外，不应该有pause anim的地方
            }

            let mcomps = child.getComponents(MyComponent);
            for (const mcomp of mcomps) {
                mcomp.enableSaveForPause = mcomp.enabled; // 记录原启用状态
                mcomp.enabled = false;

                sch.pauseTarget(mcomp); // 除此之外，不应该有pause schedule的地方
            }

            this._pauseChildren(child);
        }
    }

    resume() {
        if (!this.gamePause) return;
        this.gamePause = false;
        this._resumeChildren(this.node);
    }

    _resumeChildren(node: cc.Node) {
        let sch = cc.director.getScheduler();
        for (const child of node.children) {
            child.resumeAllActions(); // 除此之外，不应该有pause action的地方
            let anim = child.getComponent(cc.Animation);
            if (anim) {
                anim.resume(); // 除此之外，不应该有pause anim的地方
            }

            let mcomps = child.getComponents(MyComponent);
            for (const mcomp of mcomps) {
                mcomp.enabled = mcomp.enableSaveForPause;
                sch.resumeTarget(mcomp); // 除此之外，不应该有pause schedule的地方
            }

            this._resumeChildren(child);
        }
    }

    pauseOrResume() {
        if (this.gamePause) {
            this.resume();
        } else {
            this.pause();
        }
    }
}
