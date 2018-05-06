// Destroyee.ts
// 可被破坏物，处理被hero攻击的逻辑，是enemy和pot的基类
// lly 2018.5.12

const {ccclass, property, executeInEditMode} = cc._decorator;

import {ObjCollider, CollisionData} from "./ObjCollider";
import ItemCtrlr from "./ItemCtrlr";
import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import Gravity from "./Gravity";
import Attack from "./Attack";

/** 敌人对于一种伤害的无敌时间（毫秒） */
const InvcTime: number = 1000;

@ccclass
@executeInEditMode
export default abstract class Destroyee extends cc.Component {

    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;

    itemCtrlr: ItemCtrlr = null;

    /** 所有带有精灵的节点，用于显示受伤 */
    allSpNodes: cc.Node[] = [];

    onLoad() {
        this.objCollider = this._createComp(ObjCollider);
        this.objCollider.callback = this.onCollision.bind(this);
        if (CC_EDITOR) return;

        this.itemCtrlr = cc.find("main/item_layer").getComponent(ItemCtrlr);
    }

    start() {
        if (CC_EDITOR) return;
        
        // 获取精灵节点
        let allSps = this.getComponents(cc.Sprite);
        for (const sp of allSps) {
            this.allSpNodes.push(sp.node);
        }
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
        atk.excuteHitCallback(this.node);

        let {death, dmg, crit} = this._calcHurt(atk);
        let pos: cc.Vec2 = this._getCenterPos();
        if (!death) {
            this._showHurtColor();
            this.scheduleOnce(this._recoveryHurtColor.bind(this), 0.1);
            this._hurt(pos, atk, dmg, crit);
        } else {             
            this._dead(pos);
            this.itemCtrlr.createItem(pos);
            this.node.removeFromParent();
        }
    }

    _getCenterPos(): cc.Vec2 {
        let node = this.node;  
        let xCenter = node.x + node.width * (0.5 - node.anchorX);
        let yCenter = node.y + node.height * (0.5 - node.anchorY);
        return cc.v2(xCenter, yCenter);
    }

    // 显示受伤，所有ui变红
    _showHurtColor() {
        for (const spNode of this.allSpNodes) {
            spNode.color = cc.color(255, 80, 80, 255);
        }
    }

    _recoveryHurtColor() {
        for (const spNode of this.allSpNodes) {
            spNode.color = cc.Color.WHITE;
        }
    }  

    abstract _calcHurt(atk: Attack): {death: boolean, dmg: number, crit: boolean};
    abstract _hurt(pos: cc.Vec2, atk: Attack, dmg: number, crit: boolean);
    abstract _dead(pos: cc.Vec2);
}

