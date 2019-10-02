// GameCtrlr.ts
// 游戏控制器，负责一些游戏的整体控制，切换地图
// lly 2018.5.12

const { ccclass, property } = cc._decorator;

import { AreaType, GroundInfo, MapCtrlr } from './MapCtrlr';
import { TerrainCtrlr } from './TerrainCtrlr';

import { Hero } from './Hero';
import { ActState } from './SMForHero';
import HeroOperator from './HeroOperator';

import EnemyCtrlr from './EnemyCtrlr';
import SpineCtrlr from './SpineCtrlr';
import PotCtrlr from './PotCtrlr';

import { ItemCtrlr } from './ItemCtrlr';
import Curtain from './Curtain';
import CameraCtrlr from './CameraCtrlr';
import UICtrlr from './UICtrlr';

import { GameMemory } from './GameMemory';

import MyComponent from './MyComponent';

/** 播放状态 */
export enum PlayState {
    /** 游戏状态，可以操作 */
    game = 1,
    /** 剧情状态，不可以操作 */
    story = 2,
}

enum TurningType {
    fade = 1,
    square = 2,
}

let sch = cc.director.getScheduler();

@ccclass
export class GameCtrlr extends cc.Component {
    @property(MapCtrlr)
    mapCtrlr: MapCtrlr = null;

    @property(TerrainCtrlr)
    terrainCtrlr: TerrainCtrlr = null;

    @property(Hero)
    hero: Hero = null;

    @property(HeroOperator)
    operator: HeroOperator = null;

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

    @property(CameraCtrlr)
    camera: CameraCtrlr = null;

    @property(UICtrlr)
    ui: UICtrlr = null;

    gameMemory: GameMemory = null;

    /** 从0开始，0则为家 */
    private curSceneIndex: number = 0;
    /** 从0开始 */
    private curAreaIndex: number = 0;

    gamePause: boolean = false;

    /** 播放状态，游戏还是剧情 */
    playState: PlayState = PlayState.game;

    turningTypes: { hide: TurningType; show: TurningType } = { hide: TurningType.fade, show: TurningType.fade };

    // 游戏总数据 ========================================================

    /** 下次进入fight场景时都可能进入的场景序号 */
    needFightSceneIndexs: number[] = [];

    // 所有默认直接onload的之后
    start() {
        this.gameMemory = new GameMemory(this.onMemoryLoad.bind(this));
        this.gameMemory.load();
    }

    onMemoryLoad() {
        let sceneIndex = this.gameMemory.loadedData.curScene;
        if (sceneIndex == 0) {
            this.enterHomeScene();
        } else {
            this.enterFightScene(sceneIndex);
        }
    }

    enterHomeScene(callback = null) {
        this.curSceneIndex = 0;
        callList(this, [
            [this._clearAllData],
            [this._loadScene],
            [this._createScene],
            [this._loadSpineRes],
            [this._createObjs],
            [this._gotoHeroSpot],
            [this._prepareFightSceneData],
            [this._resetHeroState],
            [this._showScene],
            [
                () => {
                    if (callback) callback();
                },
            ],
        ]);
    }

    enterFightScene(index: number, callback = null) {
        this.curSceneIndex = index;
        callList(this, [
            [this._clearAllData],
            [this._loadScene],
            [this._loadAreas],
            [this._createScene],
            [this._loadEnemyRes],
            [this._loadSpineRes],
            [this._loadPotRes],
            [this._createObjs],
            [this._gotoHeroSpot],
            [this._collectGarbage],
            [this._resetHeroState],
            [this._showScene],
            [
                () => {
                    if (callback) callback();
                },
            ],
        ]);
    }

    _clearAllData(callNext: () => void, lastData: any) {
        this.enemyCtrlr.clear();
        this.spineCtrlr.clear();
        this.potCtrlr.clear();
        this.itemCtrlr.clear();
        return callNext();
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
        let areaCount = this.mapCtrlr.getTempAreaCount();
        let index = 0;
        let wrongTimes = 0;
        while (index < areaCount) {
            let suc = await this._loadAreaByIndexAsync(index);
            cc.log('load area: ', index, suc);

            if (suc) {
                index++;
            } else {
                wrongTimes++;

                if (this.curSceneIndex == 0) {
                    // 在家，删除重新创建
                    if (wrongTimes >= 10 && this.mapCtrlr.preparing == false) {
                        this.mapCtrlr.deleteSaveFile(this.curSceneIndex, this.curAreaIndex);
                        this.mapCtrlr.prepareFightSceneData([this.curSceneIndex], () => {});
                        wrongTimes = 0;
                        await this._sleepSync(0.5);
                    }
                } else {
                    // 战斗场景，直接返回家
                    if (wrongTimes >= 2) {
                        return this.enterHomeScene();
                    }
                }

                await this._sleepSync(0.5);
            }
        }
        callNext();
    }

    async _loadAreaByIndexAsync(index: number): Promise<boolean> {
        if (!(await this._resetAreaJsonSync(index))) return false;
        if (!(await this._checkAreaJsonSync(index))) return false;
        return true;
    }

    _resetAreaJsonSync(index): Promise<boolean> {
        return new Promise(resolve => {
            this.mapCtrlr.resetAreaJson(index, (suc: boolean) => {
                resolve(suc);
            });
        });
    }

    _checkAreaJsonSync(index): Promise<boolean> {
        return new Promise(resolve => {
            this.mapCtrlr.checkAreaJson(index, (suc: boolean) => {
                resolve(suc);
            });
        });
    }

    _sleepSync(second: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => resolve(), second * 1000);
        });
    }

    _createScene(callNext: () => void, lastData: any) {
        return this.mapCtrlr.createMapData(callNext);
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
        for (let index = 0; index < len; index++) {
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
        let { area, pX, pY } = this.mapCtrlr.getHeroPos();
        this._changeArea(area, pX, pY);
        this.hero.resetHero(); // 切换场景时，重置hero
        return callNext();
    }

    _resetHeroState(callNext: () => void, lastData: any) {
        this._turnPlayState(PlayState.game);
        this.hero.setActState(ActState.stand);
        this.hero.move(0);
        return callNext();
    }

    async _showScene(callNext: () => void, lastData: any) {
        await this._showSceneSync();
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

    // ========================================================

    dead() {
        this._deadAsync();
    }

    async _deadAsync() {
        this._turnPlayState(PlayState.story);
        await this._beginSlowTimeSync(2.4);

        this.turningTypes = {
            hide: TurningType.fade,
            show: TurningType.fade,
        };

        await this._hideSceneSync();
        await this._sleepSync(2);

        this.enterHomeScene();
    }

    _hideSceneSync() {
        return new Promise(resolve => {
            let hideType = this.turningTypes.hide;
            let pos = this._getHeroPosInView();
            if (hideType == TurningType.fade) {
                this.curtain.hideSceneByFade(pos, resolve);
            } else {
                this.curtain.hideSceneBySquare(pos, resolve);
            }
        });
    }

    _showSceneSync() {
        return new Promise(resolve => {
            let hideType = this.turningTypes.hide;
            let pos = this._getHeroPosInView();
            if (hideType == TurningType.fade) {
                this.curtain.showSceneByFade(pos, resolve);
            } else {
                this.curtain.showSceneBySquare(pos, resolve);
            }
        });
    }

    _getHeroPosInView(): cc.Vec2 {
        let vSize = cc.view.getVisibleSize();
        let heroPos = this.hero.node.position;
        heroPos.addSelf(cc.v2(0, this.hero.node.height * 0.5));
        let cameraPos = this.camera.node.position;
        let subPos = heroPos.sub(cameraPos);
        let p = subPos.add(cc.v2(vSize.width * 0.5, vSize.height * 0.5));
        return p;
    }

    // ========================================================

    enterSideGate(gateGid: number, lastHeroPos: cc.Vec2) {
        let { thisX, thisY, otherArea, otherX, otherY } = this.mapCtrlr.getGatePos(gateGid);
        let diff = cc.pSub(lastHeroPos, cc.v2(thisX, thisY));
        this._changeArea(otherArea, otherX, otherY, diff.x, diff.y);
    }

    enterMidGate(gateGid: number) {
        let { otherArea, otherX, otherY } = this.mapCtrlr.getGatePos(gateGid);
        this._changeArea(otherArea, otherX, otherY);
    }

    _changeArea(areaIndex: number, x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        cc.log('>>>>> change area', areaIndex);
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

    // ========================================================

    /**
     * 能否操作，改变hero移动和攻击状态，hero失去被攻击范围和视野范围
     */
    _turnPlayState(state: PlayState) {
        if (state == this.playState) return;
        this.playState = state;
        if (this.playState == PlayState.game) {
            this.operator.enabled = true;
            this.operator.node.resumeSystemEvents(false);
            this.hero.objCollider.enabled = true;
            this.hero.watchCollider.enabled = true;
            this.ui.setUsingBtnEnabled(true);
            this.ui.setPauseBtnEnabled(true);
        } else {
            this.operator.enabled = false;
            this.operator.node.pauseSystemEvents(false);
            this.hero.objCollider.enabled = false;
            this.hero.watchCollider.enabled = false;
            this.ui.setUsingBtnEnabled(false);
            this.ui.setPauseBtnEnabled(false);
        }
    }

    endSlowCallId: number = null;

    _beginSlowTime(second: number, callback: () => void) {
        if (this.endSlowCallId != null) {
            clearTimeout(this.endSlowCallId);
        } else {
            cc.game.setFrameRate(10);
        }
        this.endSlowCallId = setTimeout(() => {
            cc.game.setFrameRate(60);
            callback();
            this.endSlowCallId = null;
        }, second * 1000);
    }

    _beginSlowTimeSync(second: number): Promise<void> {
        return new Promise(resolve => {
            this._beginSlowTime(second, () => {
                resolve();
            });
        });
    }

    // ========================================================

    async test1() {
        // // 测试
        this._turnPlayState(PlayState.story);

        this.hero.setActState(ActState.stand);

        this.turningTypes = {
            hide: TurningType.square,
            show: TurningType.square,
        };

        await this._hideSceneSync();

        this.enterFightScene(1);
    }

    async test1Async() {
        this._turnPlayState(PlayState.story);

        this.turningTypes = {
            hide: TurningType.square,
            show: TurningType.square,
        };

        // 帷幕
        await this._hideSceneSync();
        this.enterFightScene(1);
    }

    test2() {
        this.enemyCtrlr.clear();
    }

    test3() {}

    test4() {}
}
