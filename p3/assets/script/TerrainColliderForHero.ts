// TerrainColliderForHero.ts
// 生物（hero和enemy）的地形碰撞组件
// 拥有此组件的单位会进行与地形形成碰撞
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

import TerrainColliderForCreature from "./TerrainColliderForCreature";
import GameCtrlr from "./GameCtrlr";

@ccclass
export default class TerrainColliderForHero extends TerrainColliderForCreature {

    gameCtrlr: GameCtrlr = null;

    gateGid: number = null;

    onLoad() {
        super.onLoad();
        this.gameCtrlr = cc.find("main").getComponent(GameCtrlr);
    }

    update(_: number) {
        this._checkCollision();
        this._checkOutOfRange();
        this._checkSuperGravityForSlope();

        let size = this.tsize || this.node.getContentSize();
        let anchor = this.node.getAnchorPoint();
        let anchorW = size.width * anchor.x;
        let anchorH = size.height * anchor.y;
        let xCenter = this.node.x - anchorW + size.width * 0.5;
        let yCenter = this.node.y - anchorH + size.height * 0.5;

        // 门
        let gateGid = this.terrainCtrlr.getGateData(xCenter, yCenter);

        if (this.xOutRangeDir == 0 && this.yOutRangeDir == 0) {
            this.gateGid = gateGid; // 记录gate，边门在出界时候用，中门在点击时候用

        } else {
            if (this.gateGid == null) {
                this._handleOutOfRange();

            } else {
                this.gameCtrlr.enterSideGate(this.gateGid, this.node.position);
            }
        }
    }
}