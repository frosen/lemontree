// MapCtrlr.ts
// 地图管理器：
// 控制tiledmap，Map里面有各个场景（scene）每个场景中有多个区域（area），每个区域是由多个区块（block）和通道组成
// 场景和区域的序号从1开始
// lly 2018.6.6

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import GameCtrlr from "./GameCtrlr";
import {TerrainCtrlr} from "./TerrainCtrlr";

import * as MapCheck from "../script_map/MapCheck";

let scheduler = cc.director.getScheduler();

// 已经形成的地形的类 ========================================================

/**
 * 地面信息，用于生成enemy或者pot时候使用，不同属性的地面可以生成的东西不一样
 * 凡是地面，那么其上面两格必定为空
 */
export class GroundInfo {
    x: number;
    y: number;
    wide: boolean;
}

/** 每个区域中触发点的属性 */
class TriggerJson {
    x: number;
    y: number;
    area: number;
    id: number;
}

/** 场景属性，记录当前场景的一些数据 */
export class SceneAttri {
    cardIndexs: number[];
}

export enum AreaType {
    normal = 0,
    advance = 1, // scene有可能分两个部分，那么后一部分就是advance
}

/** 一个区域的属性 */
class AreaJson {
    te: number[][];
    co: number[][];
    w: number;
    h: number;
    groundInfo: number[];

    getGroundInfoLen(): number {
        return this.groundInfo.length / 3;
    }

    getGroundX(index: number): number {
        return this.groundInfo[index];
    }

    getGroundY(index: number): number {
        return this.groundInfo[index + 1];
    }

    getGroundType(index: number): number {
        return this.groundInfo[index + 2];
    }
}

/** 一个场景的属性 */
class SceneJson {
    areas: AreaJson[];
    areaTypes: AreaType[];
    heros: TriggerJson[];
    gates: {[key: number]: {[key: number]: TriggerJson[];};};
    spines: TriggerJson[][];
    attri: SceneAttri;
}

// 模板类 ========================================================

class FixedAreaTempJson {
    rX: number;
    rY: number;
    rW: number;
    rH: number;
    tX: number;
    tY: number;
    tW: number;
    tH: number;
    te: number[][];
    co: number[][];
    door: number[][]; // 上下左右的门
    substitutes: number[]; // 当一个方向不可有门时替代它的方向，0-3上下左右
}

class AreaTempJson {
    rW: number;
    rH: number;
    noeps: number[]; // 不可有敌人的地面块
    fis: FixedAreaTempJson[]; // 固定块
    ra: number[][]; // 随机位置
}

class SceneTempJson {
    areaTemps: AreaTempJson[];
    areaTypes: AreaType[];
    heros: TriggerJson[];
    gates: {[key: number]: {[key: number]: TriggerJson[];};};
    spines: TriggerJson[][];
    attri: SceneAttri;
}

// ========================================================

@ccclass
export class MapCtrlr extends MyComponent {

    @property(TerrainCtrlr)
    terrainCtrlr: TerrainCtrlr = null;

    gameCtrlr: GameCtrlr = null;

    mapPool: cc.TiledMap[] = [];

    sceneJsons: SceneJson[] = [];
    frames: cc.SpriteFrame[] = [];

    /** 当前场景中每个区域对应的地图的列表 */
    curAssets: cc.TiledMapAsset[] = [];

    /** 特殊场景（家） */
    @property(cc.JsonAsset) homeMapJson: cc.JsonAsset = null;
    @property(cc.SpriteFrame) homeFrame: cc.SpriteFrame = null;

    onLoad() {
        this.gameCtrlr = cc.find("main").getComponent(GameCtrlr);

        // 生成多个map的节点池
        for (let index = 0; index < 10; index++) {
            let node = new cc.Node();
            let map = node.addComponent(cc.TiledMap);
            this.mapPool.push(map);

            node.setAnchorPoint(0, 0);
            node.setPosition(0, 0);

            this.node.addChild(node);

            node.active = false;
        }

        // 读取信息
    }

    // ========================================================

    createHomeScene(finishCallback: () => void) {
        callList(this, [
            [this._loadHomeJsonAndTexture],
            [this._createMapData],
            [this._holdMapAsset],
            [(callNext: () => void, lastData: any) => {
                return finishCallback();
            }]
        ]);
    }

    createFightScene(finishCallback: () => void) {
        callList(this, [
            [this._loadMapJson],
            [this._loadTexture],
            [this._createMapData],
            [this._holdMapAsset],
            [(callNext: () => void, lastData: any) => {
                return finishCallback();
            }]
        ]);
    }

    _loadHomeJsonAndTexture(callNext: () => void, lastData: any) {
        let curScene = this.gameCtrlr.getCurScene();
        if (this.sceneJsons[curScene]) {
            return callNext();
        }
        this.sceneJsons[curScene] = this.homeMapJson.json;
        this.frames[curScene] = this.homeFrame;
        return callNext();
    }

    _loadMapJson(callNext: () => void, lastData: any) {
        let curScene = this.gameCtrlr.getCurScene();
        if (this.sceneJsons[curScene]) {
            return callNext();
        }

        let url = `map/scene${curScene}/terrain/area`;
        cc.loader.loadRes(url, cc.TextAsset, (err, data) => {
            if (err) {
                cc.error(`Wrong in loadMapJson: ${err.message}`);
                return;
            }

            let decodeStr = "";
            this.sceneJsons[curScene] = JSON.parse(decodeStr);
            return callNext();
        });
    }

    _loadTexture(callNext: () => void, lastData: any) {
        let curScene = this.gameCtrlr.getCurScene();
        if (this.frames[curScene]) {
            return callNext();
        }

        let url = `map/scene${curScene}/terrain/tiles`;
        cc.loader.loadRes(url, cc.SpriteFrame, (err, frame: cc.SpriteFrame) => {
            if (err) {
                cc.error(`Wrong in loadTexture: ${err.message}`);
                return;
            }
            this.frames[curScene] = frame;
            return callNext();
        });
    }

    /** 根据读取的map信息，按照tilemap规则，生成对应的tilemap数据，然后生成tiledmap */
    _createMapData(callNext: () => void, lastData: any) {
        let curScene = this.gameCtrlr.getCurScene();
        this.curAssets = [];

        let areaJsons = this.sceneJsons[curScene].areas;
        let frame = this.frames[curScene];
        for (let index = 0; index < areaJsons.length; index++) {
            let tmxStr = MapCtrlr._createTMXString(areaJsons[index]);

            let ourmap = new cc.TiledMapAsset();
            ourmap.tmxXmlStr = tmxStr;

            ourmap.textureNames = ["tiles.png"];
            ourmap.textures = [frame.getTexture()];

            ourmap.tsxFileNames = ["tiles.tsx"];

            let tsxData = new cc.TextAsset();
            tsxData.text = MapCtrlr._createTSXString(frame.getOriginalSize());
            ourmap.tsxFiles = [tsxData];

            this.curAssets.push(ourmap);
        }

        return callNext();
    }

    /** 生成tiledmap所用的地图数据 */
    static _createTMXString(json: AreaJson): string {
        let w: number = json.w;
        let h: number = json.h;

        let terrainStrs = [];
        for (const line of json.te) {
            terrainStrs.push(line.toString() + ",");
        }
        let terrainStr = terrainStrs.join("\n");

        let tmxStr: string = `
            <?xml version="1.0" encoding="UTF-8"?>
            <map version="1.0" tiledversion="1.0.3" orientation="orthogonal" renderorder="left-down" width="${w}" height="${h}" tilewidth="32" tileheight="32" nextobjectid="0">
                <tileset firstgid="1" source="tiles.tsx"/>
                <layer name="terrain" width="${w}" height="${h}">
                    <data encoding="csv">
                        ${terrainStr}
                    </data>
                </layer>
            </map>
        `;

        return tmxStr;
    }

    /** 生成tiledmap所用的地图块属性数据 */
    static _createTSXString(size: cc.Size): string {
        let tileLen = 32;
        let {width: w, height: h} = size;

        let col = w / tileLen;
        let count = w * h;

        let tsxStr: string = `
            <?xml version="1.0" encoding="UTF-8"?>
            <tileset name="tiles" tilewidth="${tileLen}" tileheight="${tileLen}" tilecount="${count}" columns="${col}">
                <image source="tiles.png" width="${w}" height="${h}"/>
            </tileset>
        `;

        return tsxStr;
    }

    _holdMapAsset(callNext: () => void, lastData: any) {
        for (let index = 0; index < this.curAssets.length; index++) {
            const asset = this.curAssets[index];
            this.mapPool[index].tmxAsset = asset;
        }
        return callNext();
    }

    // ========================================================

    prepCallback: () => void = null;
    /** 所需准备的场景列表，场景序号从1开始 */
    prepScenes: number[] = [];
    /** 当前正在准备的场景索引 从0开始*/
    curPrepSceneIdx: number = 0;
    curPrepScene: number = 0;
    /** 场景模板列表 */
    sceneTempJsons: SceneTempJson[] = [];

    curPrepAreaIdx: number = 0;
    curAreaTempJsons: AreaTempJson[] = [];

    /** 在下一帧执行当前类的函数 */
    _callInNextFrame(func: () => void) {
        scheduler.schedule(func.bind(this), this, 0, 0, 0, false);
    }

    /**
     * 准备战斗场景的随机地图数据，
     * 考虑到可能比较慢，采用多线程异步创建，也就是在Home的时候就开始一张张创建了，然后本地保存
     * 进入战斗场景时，如果没创建完，则loading等待直到完成进入
     */
    prepareFightSceneData(scenes: number[], callback: () => void) {
        this.prepCallback = callback;
        this.prepScenes = scenes;
        this.curPrepSceneIdx = -1;

        return this._manageSceneIdx();
    }

    _manageSceneIdx() {
        this.curPrepSceneIdx++;
        if (this.curPrepSceneIdx < this.prepScenes.length) {
            this.curPrepScene = this.prepScenes[this.curPrepSceneIdx];
            return this._checkFinishedDataAndLoad();
        } else {
            return this.prepCallback();
        }
    }

    /** 检测是否已经生成过了 */
    _checkFinishedDataAndLoad() {
        this._loadSceneTempJson();
    }

    _loadSceneTempJson() {
        if (this.sceneTempJsons[this.curPrepScene]) {
            return this._initAreaPreparation();
        }

        let url = `map/scene${this.curPrepScene}/terrain/area`;
        cc.loader.loadRes(url, cc.JsonAsset, (err, jsonData) => {
            if (err) {
                cc.error(`Wrong in _loadSceneTempJson: ${err.message}`);
                return;
            }

            this.sceneTempJsons[this.curPrepScene] = jsonData.json;
            return this._callInNextFrame(this._checkSceneTempJson);
        });
    }

    checkTotal: number = 0;
    _checkJsonNum(obj: Object) {
        if (obj.constructor == Number) {
            this.checkTotal += <number>obj;
        } else if (obj instanceof Array) {
            for (const iterator of obj) {
                this._checkJsonNum(iterator);
            }
        } else if (obj instanceof Object) {
            for (const key in obj) {
                this._checkJsonNum(obj[key]);
            }
        }
    }

    _checkSceneTempJson() {
        this.checkTotal = 0;
        this._checkJsonNum(this.sceneTempJsons[this.curPrepScene]);
        if (MapCheck[this.curPrepScene] != this.checkTotal) {
            throw new Error("wrong num check");
        }

        return this._callInNextFrame(this._initAreaPreparation);
    }

    _initAreaPreparation() {
        this.curAreaTempJsons = this.sceneTempJsons[this.curPrepScene].areaTemps;
        this.curPrepAreaIdx = -1;
        return this._manageAreaIdx();
    }

    _manageAreaIdx() {
        this.curPrepAreaIdx++;
        if (this.curPrepAreaIdx < this.curAreaTempJsons.length) {

        } else {
            return this._manageSceneIdx();
        }
    }

    _sendDataToMapCreator() {

    }

    _executeMapCreate() {

    }

    // ========================================================

    getAreaCount(): number {
        let curScene = this.gameCtrlr.getCurScene();
        return this.sceneJsons[curScene].areas.length;
    }

    getAreaData(areaIndex: number): AreaJson {
        let curScene = this.gameCtrlr.getCurScene();
        let realIndex = areaIndex - 1;
        let areas = this.sceneJsons[curScene].areas;
        cc.assert(0 <= realIndex && realIndex < areas.length, "wrong area index");

        return areas[realIndex];
    }

    getAreaSize(areaIndex: number): {w: number, h: number} {
        let areaData = this.getAreaData(areaIndex);
        return {w: areaData.w, h: areaData.h};
    }

    getAreaCollisionData(areaIndex: number): number[][] {
        let areaData = this.getAreaData(areaIndex);
        return areaData.co;
    }

    getHeroPos(): {area: number, x: number, y: number} {
        let curScene = this.gameCtrlr.getCurScene();
        let hero = this.sceneJsons[curScene].heros[0]; // llytodo 不知道以后一个场景里面有多少个hero pos
        return {
            area: hero.area,
            x: hero.x,
            y: hero.y
        };
    }

    /** 获取场景中不同区域之间的门的信息 */
    getGatePos(id: number):
        {thisArea: number, thisX: number, thisY: number, otherArea: number, otherX: number, otherY: number} {
        let curScene = this.gameCtrlr.getCurScene();
        let k = this.terrainCtrlr.getGateKey(id);
        let index = this.terrainCtrlr.getGateIndex(id);
        let gates = this.sceneJsons[curScene].gates;
        let gateList = gates[k][index];

        let thisGateData: TriggerJson;
        let anotherGateData: TriggerJson;
        for (const gateData of gateList) {
            if (gateData.id == id) {
                thisGateData = gateData;
            } else {
                anotherGateData = gateData;
            }
        }

        return {
            thisArea: thisGateData.area,
            thisX: thisGateData.x,
            thisY: thisGateData.y,
            otherArea: anotherGateData.area,
            otherX: anotherGateData.x,
            otherY: anotherGateData.y
        };
    }

    getSpineInfo(areaIndex: number): {x: number, y: number, spineId: number}[] {
        let curScene = this.gameCtrlr.getCurScene();
        let realAreaIndex = areaIndex - 1;
        let spines = this.sceneJsons[curScene].spines[realAreaIndex];
        let info: {x: number, y: number, spineId: number}[] = [];
        let tileNumHeight = this.getAreaData(areaIndex).h;
        for (const spine of spines) {
            let pos = this.terrainCtrlr.getPosFromTilePos(spine.x, spine.y, tileNumHeight);
            info.push({x: pos.x, y: pos.y, spineId: spine.id});
        }
        return info;
    }

    /** 获取当前场景属性 */
    getCurSceneAttri(): SceneAttri {
        let curScene = this.gameCtrlr.getCurScene();
        return this.sceneJsons[curScene].attri;
    }

    getAreaInfo(areaIndex: number): AreaJson {
        let curScene = this.gameCtrlr.getCurScene();
        return this.sceneJsons[curScene].areas[areaIndex];
    }

    getAreaType(areaIndex: number): number {
        let curScene = this.gameCtrlr.getCurScene();
        return this.sceneJsons[curScene].areaTypes[areaIndex];
    }

    /**
     * 根据地图上的点，给每个地图生成随机位置，这些位置都在地面上
     */
    createRandomGroundPoss(areaIndex: number): {pos: cc.Vec2, t: number}[] {
        let areaInfo = this.getAreaInfo(areaIndex);
        let len = areaInfo.getGroundInfoLen();
        let count = Math.floor(len * 0.1);

        let usingGroundPoss: {pos: cc.Vec2, t: number}[] = [];
        let usingStates = {};

        let tileNumHeight = this.getAreaData(areaIndex).h;

        do {
            let k = Math.floor(Math.random() * len);
            let groundX = areaInfo.getGroundX(k);
            let groundY = areaInfo.getGroundY(k);

            let stKey = groundX * 1000 + groundY;
            let state = usingStates[stKey];

            if (!state) {
                let pos = this.terrainCtrlr.getPosFromTilePos(groundX, groundY - 1, tileNumHeight);
                usingGroundPoss.push({pos: pos, t: areaInfo.getGroundType(k)});
                usingStates[stKey] = 1;
            } else {
                // llytodo 如果有随机到重复的，在不过多增加计算量的基础上，让随机更平均
            }

        } while (usingGroundPoss.length < count);

        return usingGroundPoss;
    }

    // ========================================================

    changeArea() {
        let curArea = this.gameCtrlr.getCurArea();
        let realAreaIndex = curArea - 1;
        for (let index = 0; index < this.mapPool.length; index++) {
            this.mapPool[index].node.active = (realAreaIndex == index);
        }

        let clsnData = this.getAreaCollisionData(curArea);
        this.terrainCtrlr.setTerrainData(clsnData);
    }
}
