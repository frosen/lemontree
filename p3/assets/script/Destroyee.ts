// Destroyee.ts
// 可被破坏物，处理被hero攻击的逻辑，是enemy和pot的基类
// lly 2018.5.12

const {ccclass, property, executeInEditMode} = cc._decorator;

import MyComponent from "./MyComponent";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ColorComp from "./ColorComp";
import Attack from "./Attack";
import ItemCtrlr from "./ItemCtrlr";

/** 敌人对于一种伤害的无敌时间（毫秒） */
const InvcTime: number = 1000;

@ccclass
@executeInEditMode
export default abstract class Destroyee extends MyComponent {

    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;
    /** 颜色管理 */
    colorComp: ColorComp = null;

    itemCtrlr: ItemCtrlr = null;

    onLoad() {
        this.objCollider = this._createComp(ObjCollider);
        this.objCollider.callback = this.onCollision.bind(this);

        this.colorComp = this._createComp(ColorComp);

        if (CC_EDITOR) return;

        this.itemCtrlr = cc.find("main/item_layer").getComponent(ItemCtrlr);
    }

    start() {
        if (CC_EDITOR) return;
        this.colorComp.resetSp();
    }

    _createComp<T extends cc.Component>(type: {new(): T}): T {
        let comp = this.getComponent(type);
        if (comp) {
            return comp;
        } else {
            return this.addComponent(type);
        }
    }

    // 碰撞回调 ------------------------------------------------------------

    /** 对于某种伤害上一次碰撞的时间（毫秒） */
    invcTimeBegin: {[key: number]: number;} = {}

    onCollision(collisionDatas: CollisionData[]) {
        for (const data of collisionDatas) {
            if (data.cldr.constructor != ObjCollider) continue; // 避免碰撞到视野
            let atk = data.cldr.getComponent(Attack);
            if (atk && atk.enabled) { // 如果碰撞对象带有攻击性
                let atkIndex = atk.index;
                let curTime = (new Date()).getTime();
                let beginTime = this.invcTimeBegin[atkIndex]
                if (beginTime == null || curTime - beginTime > InvcTime) {
                    this.invcTimeBegin[atkIndex] = curTime;
                    let death = this._doHurtLogic(atk);
                }
            }
        }
    }

    _doHurtLogic(atk: Attack) {
        let {death, dmg, crit} = this._calcHurt(atk);

        atk.executeHitCallback(this.node, death, dmg, crit);

        if (!death) {
            this._showHurtColor();
            this.scheduleOnce(this._recoveryHurtColor.bind(this), 0.1);
            let pos: cc.Vec2 = this._getCenterPos();
            this._hurt(pos, atk, dmg, crit);
        } else {
            this.gotoDead();
        }
    }

    gotoDead() {
        let pos: cc.Vec2 = this._getCenterPos();
        this.itemCtrlr.createItem(pos);
        this._dead(pos);
    }

    _getCenterPos(): cc.Vec2 {
        let node = this.node;
        let xCenter = node.x + node.width * (0.5 - node.anchorX);
        let yCenter = node.y + node.height * (0.5 - node.anchorY);
        return cc.v2(xCenter, yCenter);
    }

    // 显示受伤，所有ui变红
    _showHurtColor() {
        this.colorComp.setColor("hurt", cc.color(255, 80, 80, 255))
    }

    _recoveryHurtColor() {
        this.colorComp.removeColor("hurt");
    }

    abstract _calcHurt(atk: Attack): {death: boolean, dmg: number, crit: boolean};
    abstract _hurt(pos: cc.Vec2, atk: Attack, dmg: number, crit: boolean);
    abstract _dead(pos: cc.Vec2);
}
