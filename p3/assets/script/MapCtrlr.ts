// MapCtrlr.ts
// 地图管理器：
// 控制tiledmap，Map里面有各个场景（scene）每个场景中有多个区域（area），每个区域是由多个区块（block）和通道组成
// lly 2018.6.6

const {ccclass, property} = cc._decorator;

class MapJson {
    te: number[][];
    co: number[][];
    w: number;
    h: number;
}

@ccclass
export default class MapCtrlr extends cc.Component {

    curSceneIndex: number = 0;

    mapPool: cc.TiledMap[] = [];

    mapJsons: MapJson[][] = [];
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

            node.active = false;
        }
    }

    /**
     * 创建场景
     */
    createScene(n: number) {
        this.curSceneIndex = n;
        callList(this, [
            [this._loadMapJson],
            [this._loadTexture],
            [this._createMapData],
            [this._displayMap]
        ])
    }

    _loadMapJson(callback: () => void, lastData: any) {
        if (this.mapJsons[this.curSceneIndex]) {
            callback();
            return;
        }

        let url = `map/scene${this.curSceneIndex}/area`;
        cc.loader.loadRes(url, cc.TextAsset, (err, data) => {
            if (err) {
                cc.log(`Wrong in loadMapJson: ${err.message}`);
                return;
            }

            let decodeStr = MapCtrlr._decodeMapData(data.text);
            this.mapJsons[this.curSceneIndex] = JSON.parse(decodeStr);
            callback();
        });        
    }

    static _decodeMapData(eStr: string): string {
        let len = eStr.length - 2;
        let kl = len % 4;
        let res = "";
        for (let index = 0; index < len; index++) {
            let k = kl + (index % 5);
            if (index % 2 == 0) k += 1;
            if (index % 3 == 0) k += 1;
            if (index % 14 < 7) k += 1;

            let code = eStr.charCodeAt(index + 1);
            res += String.fromCharCode(code + k * (code > 75 ? 1 : -1));          
        }

        return res;
    }

    _loadTexture(callback: () => void, lastData: any) {
        if (this.frames[this.curSceneIndex]) {
            callback();
            return;
        }

        let url = `map/scene${this.curSceneIndex}/tiles`;
        cc.loader.loadRes(url, cc.SpriteFrame, (err, frame: cc.SpriteFrame) => {
            if (err) {
                cc.log(`Wrong in loadTexture: ${err.message}`);
                return;
            }
            this.frames[this.curSceneIndex] = frame;
            callback();
        }); 
    }

    _createMapData(callback: () => void, lastData: any) {
        this.curAssets = [];

        let mapJsons = this.mapJsons[this.curSceneIndex];
        let frame = this.frames[this.curSceneIndex];
        for (let index = 0; index < this.mapJsons.length; index++) {
            let tmxStr = MapCtrlr._createTMXString(mapJsons[index]);
            
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

        callback();
    }

    static _createTMXString(json: MapJson): string {
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

    _displayMap(callback: () => void, lastData: any) {
        for (let index = 0; index < this.curAssets.length; index++) {
            const asset = this.curAssets[index];
            this.mapPool[index].tmxAsset = asset;           
        }
    }
}
