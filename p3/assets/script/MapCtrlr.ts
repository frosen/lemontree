// MapCtrlr.ts
// 地图管理器：
// 控制tiledmap，Map里面有各个场景（scene）每个场景中有多个区域（area），每个区域是由多个区块（block）和通道组成
// 场景和区域的序号从1开始
// lly 2018.6.6

const {ccclass, property} = cc._decorator;

import {TerrainCtrlr} from "./TerrainCtrlr";

class AreaJson {
    te: number[][];
    co: number[][];
    w: number;
    h: number;
}

class TriggerJson {
    x: number;
    y: number;
    area: number;
    id: number;
}

class SceneJson {
    areas: AreaJson[];
    heros: TriggerJson[];
    gates: {[key: number]: {[key: number]: TriggerJson[];};};
}

@ccclass
export default class MapCtrlr extends cc.Component {

    @property(TerrainCtrlr)
    terrainCtrlr: TerrainCtrlr = null;

    curScene: number = 1; // 从1开始

    mapPool: cc.TiledMap[] = [];

    sceneJsons: SceneJson[] = [];
    frames: cc.SpriteFrame[] = [];

    curAssets: cc.TiledMapAsset[] = [];

    groundPoss: cc.Vec2[][] = [];

    onLoad() {
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
    }

    /**
     * 创建场景
     * @param n 场景序号，从1开始
     */
    createScene(n: number, finishCallback: () => void) {
        this.curScene = n;
        callList(this, [
            [this._loadMapJson],
            [this._loadTexture],
            [this._createMapData],
            [this._displayMap],
            [(callNext: () => void, lastData: any) => {
                finishCallback();
            }]
        ]);
    }

    _loadMapJson(callNext: () => void, lastData: any) {
        if (this.sceneJsons[this.curScene]) {
            callNext();
            return;
        }

        let url = `map/scene${this.curScene}/area`;
        cc.loader.loadRes(url, cc.TextAsset, (err, data) => {
            if (err) {
                cc.log(`Wrong in loadMapJson: ${err.message}`);
                return;
            }

            let decodeStr = MapCtrlr._decodeMapData(data.text);
            this.sceneJsons[this.curScene] = JSON.parse(decodeStr);
            callNext();
        });        
    }

    static _decodeMapData(eStr: string): string {
        let h = 30
        let len = eStr.length - h;
        let kl = len % 4;
        let res = "";
        for (let index = 0; index < len; index++) {
            let k = kl + (index % 5);
            if (index % 2 == 0) k += 1;
            if (index % 3 == 0) k += 1;
            if (index % 14 < 7) k += 1;

            let code = eStr.charCodeAt(index + h);
            res += String.fromCharCode(code + k * (code > 75 ? 1 : -1));          
        }

        return res;
    }

    _loadTexture(callNext: () => void, lastData: any) {
        if (this.frames[this.curScene]) {
            callNext();
            return;
        }

        let url = `map/scene${this.curScene}/tiles`;
        cc.loader.loadRes(url, cc.SpriteFrame, (err, frame: cc.SpriteFrame) => {
            if (err) {
                cc.log(`Wrong in loadTexture: ${err.message}`);
                return;
            }
            this.frames[this.curScene] = frame;
            callNext();
        }); 
    }

    _createMapData(callNext: () => void, lastData: any) {
        this.curAssets = [];

        let areaJsons = this.sceneJsons[this.curScene].areas;
        let frame = this.frames[this.curScene];
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

        callNext();
    }

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

    static _createTSXString(size: cc.Size): string {
        let tileLen = 32;
        let {width: w, height: h} = size;

        let col = w / tileLen;
        let line = h / tileLen;
        let count = w * h;
        
        let tsxStr: string = `
            <?xml version="1.0" encoding="UTF-8"?>
            <tileset name="tiles" tilewidth="${tileLen}" tileheight="${tileLen}" tilecount="${count}" columns="${col}">
                <image source="tiles.png" width="${w}" height="${h}"/>
            </tileset>
        `;

        return tsxStr;
    }

    _displayMap(callNext: () => void, lastData: any) {
        for (let index = 0; index < this.curAssets.length; index++) {
            const asset = this.curAssets[index];
            this.mapPool[index].tmxAsset = asset;           
        }

        callNext();
    }

    getAreaCount(): number {
        return this.sceneJsons[this.curScene].areas.length;
    }

    getAreaData(areaIndex: number): AreaJson {
        let realIndex = areaIndex - 1;
        let areas = this.sceneJsons[this.curScene].areas;
        myAssert(0 <= realIndex && realIndex < areas.length, "wrong area index");

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
        let hero = this.sceneJsons[this.curScene].heros[0]; // llytodo 不知道以后一个场景里面有多少个hero pos
        return {
            area: hero.area,
            x: hero.x,
            y: hero.y
        };
    }

    getGatePos(id: number): 
        {thisArea: number, thisX: number, thisY: number, otherArea: number, otherX: number, otherY: number} {
        let k = id % 100;
        let index = Math.floor(id / 100) % 100;
        let gates = this.sceneJsons[this.curScene].gates;
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

    getGrounds(areaIndex: number): cc.Vec2[] {
        if (this.groundPoss[areaIndex]) return this.groundPoss[areaIndex];

        let grounds = [];
        let areaData = this.getAreaData(areaIndex); 
        let clsnData = areaData.co;
        for (let h = 0; h < areaData.h; h++) {
            let wData = clsnData[h];
            for (let w = 0; w < areaData.w; w++) {
                let gid = wData[w];
                if (gid == 1 || gid == 3) {
                    grounds.push(cc.v2(w, h));
                }
            }        
        }

        this.groundPoss[areaIndex] = grounds;
        return grounds;
    }

    /**
     * 根据地图上的点，给每个地图生成随机位置，这些位置都在地面上
     */
    createRandomGroundPoss(areaIndex: number): cc.Vec2[] {
        let grounds = this.getGrounds(areaIndex);

        let count = Math.floor(grounds.length * 0.1);

        let usingGroundPoss = [];
        let usingStates = {};

        do {
            let k = Math.floor(Math.random() * grounds.length);
            let ground = grounds[k];
            
            let stKey = ground.x * 1000 + ground.y;
            let state = usingStates[stKey];

            if (!state) {
                let tileNumHeight = this.getAreaData(areaIndex).h;
                let pos = this.terrainCtrlr.getPosFromTilePos(ground.x, ground.y - 1, tileNumHeight);
                usingGroundPoss.push(pos);
                usingStates[stKey] = 1;
            } else {

            }

        } while (usingGroundPoss.length < count);
        
        return usingGroundPoss;
    }

    createRandomAirPoss() {

    }

    changeArea(areaIndex: number) {
        let realAreaIndex = areaIndex - 1;
        for (let index = 0; index < this.mapPool.length; index++) {
            this.mapPool[index].node.active = (realAreaIndex == index);           
        }

        let clsnData = this.getAreaCollisionData(areaIndex);
        this.terrainCtrlr.setTerrainData(clsnData);
    }
}