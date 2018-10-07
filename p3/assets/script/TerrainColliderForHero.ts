// TerrainColliderForHero.ts
// 生物（hero和enemy）的地形碰撞组件
// 拥有此组件的单位会进行与地形形成碰撞
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import TerrainColliderForCreature from "./TerrainColliderForCreature";
import GameCtrlr from "./GameCtrlr";

@ccclass
export default class TerrainColliderForHero extends TerrainColliderForCreature {

    gateGid: number = null;

    update(_: number) {
        this._checkCollision();
        this._checkOutOfRange();
        this._checkSuperGravityForSlope();

        let size = this.size || this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();
        let anchorW = size.width * anchor.x;
        let anchorH = size.height * anchor.y;
        let xCenter = this.node.x - anchorW + size.width * 0.5;
        let yCenter = this.node.y - anchorH + size.height * 0.5;

        if (this.xOutRangeDir == 0 && this.yOutRangeDir == 0) {
            this.gateGid = this.terrainCtrlr.getGateData(xCenter, yCenter);

        } else {
            if (this.gateGid == null) {
                this._handleOutOfRange();

            } else {
                let gameCtrlr = cc.find("main").getComponent(GameCtrlr);
                gameCtrlr.enterGate(this.gateGid, this.node.position);
            }
        }
    }
}