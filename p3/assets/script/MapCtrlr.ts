// MapCtrlr.ts
// 地图管理器：
// 控制tiledmap，Map里面有各个场景（scene）每个场景中有多个区域（area），每个区域是由多个区块（block）和通道组成
// 场景和区域的序号从1开始
// lly 2018.6.6

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import GameCtrlr from "./GameCtrlr";
import {TerrainCtrlr} from "./TerrainCtrlr";

import * as eleData from "../script_map/ele";

import * as sceneDataHome from "../script_map/scenedata_0";
import * as sceneData1 from "../script_map/scenedata_1";

// 已经形成的地形的类 ========================================================

/** 每个区域中触发点的属性 */
class TriggerJson {
    pX: number;
    pY: number;
    area: number;
    id: number;
}

export class SpineJson {
    pX: number;
    pY: number;
    id: number;
}

/** 场景属性，记录当前场景的一些数据 */
export class SceneAttri {
    cardIndexs: number[];
}

export enum AreaType {
    normal = 0,
    advance = 1 // scene有可能分两个部分，那么后一部分就是advance
}

/** 地面类型 */
export enum GroundType {
    normal = 1, // 上面两格为空
    wide = 2, // 自己和左右都是normal
    high = 3, // 上面四格及以上为空
    wihi = 4 // 又是wide又是high
}

/**
 * 地面信息，用于生成enemy或者pot时候使用，不同属性的地面可以生成的东西不一样
 */
export class GroundInfo {
    pX: number;
    pY: number;
    groundType: GroundType;
}

/** 一个区域的属性 */
class AreaJson {
    te: number[][];
    co: number[][];
    rW: number;
    rH: number;

    spines: SpineJson[];
    groundInfos: number[];

    ak: number;

    getGroundInfoLen(): number {
        return this.groundInfos.length / 3;
    }

    getGroundInfo(index: number): GroundInfo {
        let gInfo = new GroundInfo();
        gInfo.pX = this.groundInfos[Math.floor(index / 3)];
        gInfo.pY = this.groundInfos[Math.floor(index / 3) + 1];
        gInfo.groundType = this.groundInfos[Math.floor(index / 3) + 2];
        return gInfo;
    }
}

/** 一个场景的属性 */
class SceneJson {
    areas: AreaJson[];
    areaTypes: AreaType[];
    heros: TriggerJson[];
    gates: {[key: number]: {[key: number]: TriggerJson[]}};
    attri: SceneAttri;
}

// 模板类 ========================================================
// 不在js中使用的变量，用object表示

class SceneTempJson {
    areaTemps: object[];
    areaTypes: AreaType[];
    heros: TriggerJson[];
    gates: {[key: number]: {[key: number]: TriggerJson[]}};
    attri: SceneAttri;
}

// ========================================================

@ccclass
export class MapCtrlr extends MyComponent {
    @property(TerrainCtrlr)
    terrainCtrlr: TerrainCtrlr = null;

    /** 生成场景地图所用的temp，0是home但是为空 */
    sceneTempJsons: SceneTempJson[] = [];

    gameCtrlr: GameCtrlr = null;

    mapPool: cc.TiledMap[] = [];

    sceneJsons: SceneJson[] = [];
    frames: cc.SpriteFrame[] = [];

    /** 当前场景中每个区域对应的地图的列表 */
    curAssets: cc.TiledMapAsset[] = [];

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

        // 读取各个场景的js，因为js会被打包加密，所以用js而不是json
        this.sceneJsons[0] = sceneDataHome;

        this.sceneTempJsons.push(null);
        this.sceneTempJsons.push(sceneData1);

        // 读取生成地图所用元素
    }

    loadMapEles() {
        for (const base of eleData.bases) {
            my.MapCreator.getInstance().addMapEleBase(base);
        }

        for (const ele of eleData.eles) {
            my.MapCreator.getInstance().addMapEle(ele);
        }

        let list = eleData.list;
        for (let w = 0; w < list.length; w++) {
            const listHD = list[w];
            for (let h = 0; h < listHD.length; h++) {
                const listD = listHD[h];
                for (let d = 0; d < listD.length; d++) {
                    const indexs = listD[d];
                    my.MapCreator.getInstance().addMapEleIndexs(w, h, d, 0, indexs[0]);
                    my.MapCreator.getInstance().addMapEleIndexs(w, h, d, 1, indexs[1]);
                }
            }
        }
    }

    // ========================================================

    // 用一个数字表示area的信息
    getSceneKey(sceneIndex, areaIndex) {
        let sceneTemp = this.sceneTempJsons[sceneIndex];
        let areaType = sceneTemp.areaTypes[areaIndex];
        return sceneIndex * 10000 + areaIndex * 100 + areaType;
    }

    /** 从本地读取已经生成的场景json */
    loadSceneJson(finishCallback: () => void) {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        if (this.sceneJsons[curSceneIndex]) {
            return finishCallback();
        }

        let sceneTemp: SceneTempJson = this.sceneTempJsons[curSceneIndex];

        let thisSceneJson = new SceneJson();
        thisSceneJson.areaTypes = sceneTemp.areaTypes;
        thisSceneJson.heros = sceneTemp.heros;
        thisSceneJson.gates = sceneTemp.gates;
        thisSceneJson.attri = sceneTemp.attri;
        thisSceneJson.areas = [];

        this.sceneJsons[curSceneIndex] = thisSceneJson;
        return finishCallback();
    }

    loadTexture(finishCallback: () => void) {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        if (this.frames[curSceneIndex]) {
            return finishCallback();
        }

        let url = `map/scene${curSceneIndex}/terrain/tiles`;
        cc.loader.loadRes(url, cc.SpriteFrame, (err, frame: cc.SpriteFrame) => {
            if (err) {
                cc.error(`Wrong in loadTexture: ${err.message}`);
                return;
            }
            this.frames[curSceneIndex] = frame;
            return finishCallback();
        });
    }

    resetAreaJson(areaIndex: number, finishCallback: (suc: boolean) => void) {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let sceneKey = this.getSceneKey(curSceneIndex, areaIndex);
        let filePath = my.MapCreator.getInstance().getSaveFilePath(sceneKey)
        cc.loader.loadRes(filePath, cc.JsonAsset, (err, data) => {
            if (err) {
                cc.error(`Wrong in loadMapJson: ${err.message}`);
                return finishCallback(false);
            }

            this.sceneJsons[curSceneIndex] = data;
            return finishCallback(true);
        });
    }

    checkAreaJson(areaIndex: number, finishCallback: (suc: boolean) => void) {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let sceneJson: SceneJson = this.sceneJsons[curSceneIndex];

        try {
            let areaJson = sceneJson.areas[areaIndex];
            let co = areaJson.co;

            let coW = co[0].length - 3;
            let coH = co.length - 3;

            let key = 0;
            for (let ry = 3; ry < coH; ry++) {
                let coLine = co[ry];
                for (let rx = 3; rx < coW; rx++) {
                    const coData = coLine[rx];
                    key += this._encryptKey(coData, key);
                }
            }

            for (const spineData of areaJson.spines) {
                key += this._encryptKey(spineData.pX, key);
                key += this._encryptKey(spineData.pY, key);
                key += this._encryptKey(spineData.id, key);
            }

            let realKey = areaJson.ak;
            return finishCallback(realKey == key);

        } catch (error) {
            cc.log("check area json error: ", error.message);
            return finishCallback(false);
        }
    }

    _encryptKey(v: number, key: number) {
        return (v + 1) << (key % 3);
    }

    /** 根据读取的map信息，按照tilemap规则，生成对应的tilemap数据，然后生成tiledmap
     * 注：此处curAssets和mapPool不做清理，
     *     如果本次比上次生成的少，多的部分会保存在内存里，反正也不会用到
    */
    createMapData(finishCallback: () => void) {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let areaJsons = this.sceneJsons[curSceneIndex].areas;
        let frame = this.frames[curSceneIndex];
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

            this.curAssets[index] = ourmap;
        }

        for (let index = 0; index < this.curAssets.length; index++) {
            const asset = this.curAssets[index];
            this.mapPool[index].tmxAsset = asset;
        }

        return finishCallback();
    }

    /** 生成tiledmap所用的地图数据 */
    static _createTMXString(areaJson: AreaJson): string {
        let rW: number = areaJson.rW;
        let rH: number = areaJson.rH;

        let terrainStrs = [];
        for (const line of areaJson.te) {
            terrainStrs.push(line.toString() + ",");
        }
        let terrainStr = terrainStrs.join("\n");

        let tmxStr: string = `
            <?xml version="1.0" encoding="UTF-8"?>
            <map version="1.0" tiledversion="1.0.3" orientation="orthogonal" renderorder="left-down" width="${rW}" height="${rH}" tilewidth="32" tileheight="32" nextobjectid="0">
                <tileset firstgid="1" source="tiles.tsx"/>
                <layer name="terrain" width="${rW}" height="${rH}">
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
        let {width, height} = size;

        let col = width / tileLen;
        let count = width * height;

        let tsxStr: string = `
            <?xml version="1.0" encoding="UTF-8"?>
            <tileset name="tiles" tilewidth="${tileLen}" tileheight="${tileLen}" tilecount="${count}" columns="${col}">
                <image source="tiles.png" width="${width}" height="${height}"/>
            </tileset>
        `;

        return tsxStr;
    }

    // ========================================================

    /** 生成中 */
    preparing: boolean = false;
    /** 完成回调 */
    prepFinishCallback: () => void = null;
    /** 所需准备的场景列表，场景序号从1开始 */
    prepScenes: number[] = [];
    /** 当前正在准备的场景索引 从0开始*/
    curPrepSceneIdx: number = 0;
    curPrepScene: number = 0;

    curPrepAreaIdx: number = 0;
    curPrepAreaTempJsons: object[] = null;

    sendDataDoneList: {[key: number]: boolean;} = {};

    /**
     * 准备战斗场景的随机地图数据，
     * 考虑到可能比较慢，采用多线程异步创建，也就是在Home的时候就开始一张张创建了，然后本地保存
     * 进入战斗场景时，如果没创建完，则loading等待直到完成进入
     */
    prepareFightSceneData(scenes: number[], callback: () => void) {
        if (this.preparing == true) {
            cc.error("fight scene is preparing");
            return;
        }

        this.preparing = true;
        this.prepFinishCallback = callback;
        this.prepScenes = scenes;
        this.curPrepSceneIdx = -1;

        return this._manageSceneIdx();
    }

    _manageSceneIdx() {
        this.curPrepSceneIdx++;
        if (this.curPrepSceneIdx < this.prepScenes.length) {
            this.curPrepScene = this.prepScenes[this.curPrepSceneIdx];
            return this._initAreaPreparation();
        } else {
            this.preparing = false;
            return this.prepFinishCallback();
        }
    }

    _initAreaPreparation() {
        let tempJson: SceneTempJson = this.sceneTempJsons[this.curPrepScene];
        this.curPrepAreaTempJsons = tempJson.areaTemps;
        this.curPrepAreaIdx = -1;
        return this._manageAreaIdx();
    }

    _manageAreaIdx() {
        this.curPrepAreaIdx++;
        if (this.curPrepAreaIdx < this.curPrepAreaTempJsons.length) {
            return this._executeMapCreate();
        } else {
            return this._manageSceneIdx();
        }
    }

    _executeMapCreate() {
        setTimeout(() => {
            this._sendDataToMapCreator();
    
            let sceneKey = this.getSceneKey(this.curPrepScene, this.curPrepAreaIdx);
            my.MapCreator.getInstance().createArea(sceneKey, (ret: number) => {
                cc.log("map create result:", ret);
                this._manageAreaIdx();
            });
        });
    }

    _sendDataToMapCreator() {
        let sceneKey = this.getSceneKey(this.curPrepScene, this.curPrepAreaIdx);

        if (this.sendDataDoneList[sceneKey] == true) return;
        this.sendDataDoneList[sceneKey] = true;

        let areaData = this.curPrepAreaTempJsons[this.curPrepAreaIdx];
        my.MapCreator.getInstance().addAreaTemp(sceneKey, areaData);
    }

    deleteSaveFile(sceneIndex, areaIndex) {
        let sceneKey = this.getSceneKey(sceneIndex, areaIndex);
        let filePath = my.MapCreator.getInstance().getSaveFilePath(sceneKey);
        if (jsb.fileUtils.isFileExist(filePath)) {
            jsb.fileUtils.removeFile(filePath)
        }
    }

    // ========================================================

    getTempAreaCount(): number {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        return this.sceneTempJsons[curSceneIndex].areaTemps.length;
    }

    getAreaCount(): number {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        return this.sceneJsons[curSceneIndex].areas.length;
    }

    getAreaData(areaIndex: number): AreaJson {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let areas = this.sceneJsons[curSceneIndex].areas;
        cc.assert(0 <= areaIndex && areaIndex < areas.length, "wrong area index");

        return areas[areaIndex];
    }

    getAreaSize(areaIndex: number): {rW: number; rH: number} {
        let areaData = this.getAreaData(areaIndex);
        return {rW: areaData.rW, rH: areaData.rH};
    }

    getAreaCollisionData(areaIndex: number): number[][] {
        let areaData = this.getAreaData(areaIndex);
        return areaData.co;
    }

    getHeroPos(): {area: number; pX: number; pY: number} {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let hero = this.sceneJsons[curSceneIndex].heros[0]; // llytodo 不知道以后一个场景里面有多少个hero pos
        return {
            area: hero.area,
            pX: hero.pX,
            pY: hero.pY
        };
    }

    /** 获取场景中不同区域之间的门的信息 */
    getGatePos(id: number):
        {thisArea: number, thisX: number, thisY: number, otherArea: number, otherX: number, otherY: number} {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let k = this.terrainCtrlr.getGateKey(id);
        let index = this.terrainCtrlr.getGateIndex(id);
        let gates = this.sceneJsons[curSceneIndex].gates;
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
            thisX: thisGateData.pX,
            thisY: thisGateData.pY,
            otherArea: anotherGateData.area,
            otherX: anotherGateData.pX,
            otherY: anotherGateData.pY
        };
    }

    getSpineInfo(areaIndex: number): SpineJson[] {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        let spines: SpineJson[] = this.sceneJsons[curSceneIndex].areas[areaIndex].spines;
        return spines;
    }

    /** 获取当前场景属性 */
    getCurSceneAttri(): SceneAttri {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        return this.sceneJsons[curSceneIndex].attri;
    }

    getAreaInfo(areaIndex: number): AreaJson {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        return this.sceneJsons[curSceneIndex].areas[areaIndex];
    }

    getAreaType(areaIndex: number): number {
        let curSceneIndex = this.gameCtrlr.getCurSceneIndex();
        return this.sceneJsons[curSceneIndex].areaTypes[areaIndex];
    }

    /**
     * 根据地图上的点，给每个地图生成随机位置，这些位置都在地面上
     */
    createRandomGroundInfos(areaIndex: number): GroundInfo[] {
        let areaInfo = this.getAreaInfo(areaIndex);
        let len = areaInfo.getGroundInfoLen();
        let count = Math.floor(len * 0.1);

        let usingGroundInfos: GroundInfo[] = [];
        let usingStates = {};
        let leftR = 5;

        do {
            let groundK = Math.floor(Math.random() * len);
            let groundInfo = areaInfo.getGroundInfo(groundK);
            let groundPX = groundInfo.pX
            let groundPY = groundInfo.pY;

            let stKey = groundPX * 10000 + groundPY;
            let state = usingStates[stKey];

            if (!state) {
                usingGroundInfos.push(groundInfo);
                usingStates[stKey] = 1;
            } else {
                leftR--;
                if (leftR < 0) count--;
            }

        } while (usingGroundInfos.length < count);

        return usingGroundInfos;
    }

    // ========================================================

    changeArea() {
        let curAreaIndex = this.gameCtrlr.getCurAreaIndex();
        for (let index = 0; index < this.mapPool.length; index++) {
            this.mapPool[index].node.active = (curAreaIndex == index);
        }

        let clsnData = this.getAreaCollisionData(curAreaIndex);
        this.terrainCtrlr.setTerrainData(clsnData);
    }
}