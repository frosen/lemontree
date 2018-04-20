// Item.ts
// 道具：
// lly 2018.4.12

const {ccclass, property} = cc._decorator;

import Item from "./Item";
import ItemCtrlr from "./ItemCtrlr";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";
import {ObjCollider, CollisionData} from "./ObjCollider";
import Gravity from "./Gravity";

@ccclass
export default class ItemComp extends cc.Component {

    itemCore: Item = null;

    itemCtrlr: ItemCtrlr = null;

    sp: cc.Sprite = null;
    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollider: TerrainCollider = null;
    /** 对象碰撞组件 */
    objCollider: ObjCollider = null;

    /** 道具的纹理 */
    @property([cc.SpriteFrame])
    itemFrames: cc.SpriteFrame[] = [];
    /** 道具的每张纹理显示的时间 毫秒 */
    @property([cc.Integer])
    itemFrameDisplayTimes: number[] = [];

    /** 当前纹理显示索引 */
    curFrameIndex: number = 0;
    /** 当前时间，毫秒 */
    curTime: number = 0;

    jumping: boolean = false;

    onLoad() {
        this.sp = this._createComp(cc.Sprite);
        this.movableObj = this._createComp(MovableObject);
        this.terrainCollider = this._createComp(TerrainCollider);
        this.objCollider = this._createComp(ObjCollider);
        this._createComp(Gravity);
    }

    _createComp<T extends cc.Component>(type: {new(): T}): T {
        let comp = this.getComponent(type);
        if (comp) {
            return comp;
        } else {
            return this.addComponent(type);
        }
    }

    update(dt: number) {
        this.curTime += (dt * 1000);
        let duration = this.itemFrameDisplayTimes[this.curFrameIndex];
        if (this.curTime >= duration) {
            this.curFrameIndex++;
            if (this.curFrameIndex >= this.itemFrames.length) this.curFrameIndex = 0;
            this.curTime = 0;

            this.sp.spriteFrame = this.itemFrames[this.curFrameIndex];
        }
    }

    lateUpdate() {
        if (!this.jumping) return;
        if (this.terrainCollider.curYCollisionType != CollisionType.none && 
            this.movableObj.getDir().yDir <= 0 && this.movableObj.yLastVelocity <= 0) {    
                
            // 反弹 
            let yV = this.movableObj.yLastVelocity;
            if (yV < -1) {
                this.movableObj.yVelocity = this.movableObj.yLastVelocity * (-0.5);
            } else {
                this.movableObj.xVelocity = 0;
                this.jumping = false;
            }

            // 斜面
            if (this.terrainCollider.edgeType== CollisionType.slope) {
                this.movableObj.xVelocity /= 2;
            }
        }
    }

    setData(core: Item, frames: cc.SpriteFrame[], displayTimes: number[]) {
        this.itemCore = core;
        this.itemFrames = frames;
        this.itemFrameDisplayTimes = displayTimes;

        this.curFrameIndex = 0;
        this.curTime = 0;

        this.sp.spriteFrame = this.itemFrames[this.curFrameIndex];
        this.sp.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    move(x: number, y: number) {
        this.movableObj.xVelocity = x;
        this.movableObj.yVelocity = y;
        this.jumping = true;
    }

    onCollision() {
        
    }
}
