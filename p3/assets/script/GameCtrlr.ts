// GameCtrlr.ts
// 游戏控制器，负责一些游戏的整体控制，切换地图
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import {AreaType, GroundInfo, MapCtrlr} from "./MapCtrlr";
import {TerrainCtrlr} from "./TerrainCtrlr";
import {Hero} from "./Hero";

import EnemyCtrlr from "./EnemyCtrlr";
import SpineCtrlr from "./SpineCtrlr";
import PotCtrlr from "./PotCtrlr";

import {ItemCtrlr} from "./ItemCtrlr";
import Curtain from "./Curtain";

import {GameMemory} from "./GameMemory";

import MyComponent from "./MyComponent";

let scheduler = cc.director.getScheduler();

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

    gameMemory: GameMemory = null;

    private curSceneIndex: number = 1; // 从0开始，0则为家
    private curAreaIndex: number = 1; // 从0开始

    gamePause: boolean = false;

    // 游戏总数据 ----------

    /** 下次进入fight场景时都可能进入的场景序号 */
    needFightSceneIndexs: number[] = [];

    start() { // 所有默认直接onload的之后
        this.gameMemory = new GameMemory(this.onMemoryLoad.bind(this));
        this.gameMemory.load();
    }

    onMemoryLoad() {
        let sceneIndex = this.gameMemory.loadedData.curScene;
        if (sceneIndex == 0) {
            this.changeToHomeScene();
        } else {
            this.changeToFightScene(sceneIndex);
        }
    }

    changeToHomeScene() {
        this.curSceneIndex = 0;
        callList(this, [
            [this._loadScene],
            [this._createScene],
            // [this._loadSpineRes], llytodo 以后home会有spine的
            // [this._createObjs],
            [this._gotoHeroSpot],
            // [this._prepareFightSceneData],
            [this._showScene]
        ]);
    }

    changeToFightScene(index: number) {
        this.curSceneIndex = index;
        callList(this, [
            [this._loadScene],
            [this._loadAreas],
            [this._loadEnemyRes],
            [this._loadSpineRes],
            [this._loadPotRes],
            [this._createObjs],
            [this._gotoHeroSpot],
            [this._collectGarbage],
            [this._showScene]
        ]);
    }

    _loadScene(callNext: () => void, lastData: any) {
        return this.mapCtrlr.loadSceneJson(() => {
            this.mapCtrlr.loadTexture(callNext);
        });
    }

    _loadAreas(callNext: () => void, lastData: any) {
        this._loadAreasAsync(callNext);
    }

    async _loadAreasAsync(callNext: () => void) {
        let areaCount = this.mapCtrlr.getAreaCount();
        let index = 0;
        while(index < areaCount) {
            let suc = await this._loadAreaByIndexAsync(index);
            if (suc) {
                index++;
            } else {
                await this._sleep(500);

                if
            }
        }
        callNext();
    }

    async _loadAreaByIndexAsync(index: number): Promise<boolean> {
        if (!await this._resetAreaJson(index)) return false;
        if (!await this._checkAreaJson(index)) return false;
        return true;
    }

    _resetAreaJson(index): Promise<boolean> {
        return new Promise((resolve) => {
            this.mapCtrlr.resetAreaJson(index, (suc: boolean) => {
                resolve(suc);
            });
        });
    }

    _checkAreaJson(index): Promise<boolean> {
        return new Promise((resolve) => {
            this.mapCtrlr.checkAreaJson(index, (suc: boolean) => {
                resolve(suc);
            });
        });
    }

    _sleep(t): Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => resolve(), t);
        });
    }

    _createScene(callNext: () => void, lastData: any) {
        return this.mapCtrlr.createMapData(callNext)
    }

    _loadEnemyRes(callNext: () => void, lastData: any) {
        return this.enemyCtrlr.setSceneAndLoadRes(callNext);
    }

    _loadSpineRes(callNext: () => void, lastData: any) {
        return this.spineCtrlr.setSceneAndLoadRes(callNext);
    }

    _loadPotRes(callNext: () => void, lastData: any) {
        return this.potCtrlr.setSceneAndLoadRes(callNext);
    }

    _createObjs(callNext: () => void, lastData: any) {
        let len = this.mapCtrlr.getAreaCount();
        for (let index = 1; index <= len; index++) {
            // 生成机关陷阱
            let spineInfo = this.mapCtrlr.getSpineInfo(index);
            this.spineCtrlr.setData(index, spineInfo);

            // 生成敌人
            let groundInfos: GroundInfo[];
            groundInfos = this.mapCtrlr.createRandomGroundInfos(index);
            let advance = this.mapCtrlr.getAreaType(index) == AreaType.advance;
            this.enemyCtrlr.setData(index, advance, groundInfos);

            // 生成pot
            groundInfos = this.mapCtrlr.createRandomGroundInfos(index);
            this.potCtrlr.setData(index, groundInfos);
        }
        return callNext();
    }

    _gotoHeroSpot(callNext: () => void, lastData: any) {
        let {area, pX, pY} = this.mapCtrlr.getHeroPos();
        this._changeArea(area, pX, pY);
        this.hero.resetHero(); // 切换场景时，重置hero
        return callNext();
    }

    _showScene(callNext: () => void, lastData: any) {
        this.curtain.showScene();
        return callNext();
    }

    _prepareFightSceneData(callNext: () => void, lastData: any) {
        return this.mapCtrlr.prepareFightSceneData([1], callNext);
    }

    private firstCollect = true;
    _collectGarbage(callNext: () => void, lastData: any) {
        if (this.firstCollect) {
            this.firstCollect = false; // 第一次不用回收
        } else {
            cc.sys.garbageCollect(); // 手动垃圾回收
        }
        return callNext();
    }

    enterSideGate(gateGid: number, lastHeroPos: cc.Vec2) {
        let {thisX, thisY, otherArea, otherX, otherY} = this.mapCtrlr.getGatePos(gateGid);
        let diff = cc.pSub(lastHeroPos, cc.v2(thisX, thisY));
        this._changeArea(otherArea, otherX, otherY, diff.x, diff.y);
    }

    enterMidGate(gateGid: number) {
        let {otherArea, otherX, otherY} = this.mapCtrlr.getGatePos(gateGid);
        this._changeArea(otherArea, otherX, otherY);
    }

    _changeArea(areaIndex: number, x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        cc.log(">>>>>change area", areaIndex);
        this.curAreaIndex = areaIndex;

        this.mapCtrlr.changeArea();

        this.enemyCtrlr.changeArea();
        this.spineCtrlr.changeArea();
        this.potCtrlr.changeArea();
        this.itemCtrlr.clear();

        this.hero.movableObj.blink(x + offsetX, y + offsetY);

        this.hero.onChangeArea();
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

    getCurSceneIndex() {
        return this.curSceneIndex;
    }

    getCurAreaIndex() {
        return this.curAreaIndex;
    }
}
