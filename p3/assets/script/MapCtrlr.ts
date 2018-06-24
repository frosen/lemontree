// MapCtrlr.ts
// 地图管理器：
// 控制tiledmap，Map里面有各个场景（scene）每个场景中有多个区域（area），每个区域是由多个区块（block）和通道组成
// 场景和区域的序号从1开始
// lly 2018.6.6

const {ccclass, property} = cc._decorator;

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

    curSceneIndex: number = 0;

    mapPool: cc.TiledMap[] = [];

    sceneJsons: SceneJson[] = [];
    frames: cc.SpriteFrame[] = [];

    curAssets: cc.TiledMapAsset[] = [];

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
        this.curSceneIndex = n;
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
        if (this.sceneJsons[this.curSceneIndex]) {
            callNext();
            return;
        }

        let url = `map/scene${this.curSceneIndex}/area`;
        cc.loader.loadRes(url, cc.TextAsset, (err, data) => {
            if (err) {
                cc.log(`Wrong in loadMapJson: ${err.message}`);
                return;
            }

            let decodeStr = MapCtrlr._decodeMapData(data.text);
            this.sceneJsons[this.curSceneIndex] = JSON.parse(decodeStr);
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
        if (this.frames[this.curSceneIndex]) {
            callNext();
            return;
        }

        let url = `map/scene${this.curSceneIndex}/tiles`;
        cc.loader.loadRes(url, cc.SpriteFrame, (err, frame: cc.SpriteFrame) => {
            if (err) {
                cc.log(`Wrong in loadTexture: ${err.message}`);
                return;
            }
            this.frames[this.curSceneIndex] = frame;
            callNext();
        }); 
    }

    _createMapData(callNext: () => void, lastData: any) {
        this.curAssets = [];

        let areaJsons = this.sceneJsons[this.curSceneIndex].areas;
        let frame = this.frames[this.curSceneIndex];
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

    getAreaSize(areaIndex: number): {w: number, h: number} {
        let realIndex = areaIndex - 1;
        let areas = this.sceneJsons[this.curSceneIndex].areas;
        myAssert(0 <= realIndex && realIndex < areas.length, "wrong area index");

        let areaData = areas[realIndex];
        
        return {w: areaData.w, h: areaData.h};
    }

    getAreaCollisionData(areaIndex: number): number[][] {
        let realIndex = areaIndex - 1;
        let areas = this.sceneJsons[this.curSceneIndex].areas;
        myAssert(0 <= realIndex && realIndex < areas.length, "wrong area index");

        let areaData = areas[realIndex];
        
        return areaData.co;
    }

    getHeroPos(): {area: number, x: number, y: number} {
        let hero = this.sceneJsons[this.curSceneIndex].heros[0]; // llytodo 不知道以后一个场景里面有多少个hero pos
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
        let gates = this.sceneJsons[this.curSceneIndex].gates;
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

    changeArea(areaIndex: number) {
        let realAreaIndex = areaIndex - 1;
        for (let index = 0; index < this.mapPool.length; index++) {
            this.mapPool[index].node.active = (realAreaIndex == index);           
        }
    }
}
