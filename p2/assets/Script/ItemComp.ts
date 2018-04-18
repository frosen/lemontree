// Item.ts
// 道具：
// lly 2018.4.12

const {ccclass, property} = cc._decorator;

import Item from "./Item";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {ObjCollider, CollisionData} from "./ObjCollider";
import Gravity from "./Gravity";

@ccclass
export default class ItemComp extends cc.Component {

    itemCore: Item = null;

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

    onLoad() {
        this.sp = this.createComp(cc.Sprite);
        this.movableObj = this.createComp(MovableObject);
        this.terrainCollider = this.createComp(TerrainCollider);
        this.objCollider = this.createComp(ObjCollider);
        this.createComp(Gravity);

        this.setEnabled(false);
    }

    createComp<T extends cc.Component>(type: {new(): T}): T {
        let comp = this.getComponent(type);
        if (comp) {
            return comp;
        } else {
            return this.addComponent(type);
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

        this.setEnabled(true);
    }

    setEnabled(b: boolean) {
        this.enabled = b;
        this.movableObj.enabled = b;
        this.terrainCollider.enabled = b;
        this.objCollider.enabled = b;
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

    onCollision() {
        
    }
}
