// Item.ts
// 道具：
// lly 2018.4.12

const {ccclass, property, executeInEditMode} = cc._decorator;

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {ObjCollider, CollisionData} from "./ObjCollider";
import Gravity from "./Gravity";

@ccclass
@executeInEditMode
export default class Hero extends cc.Component {

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

    /** 当前时间，毫秒 */
    curTime: number = 0;
    /** 当前纹理显示索引 */
    curFrameIndex: number = 0;

    onLoad() {
        requireComponents(this, [cc.Sprite, MovableObject, TerrainCollider, ObjCollider, Gravity]);
        myAssert(this.itemFrames.length == this.itemFrameDisplayTimes.length, "每个纹理要有显示时间");

        this.sp = this.getComponent(cc.Sprite);
        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollider = this.getComponent(TerrainCollider);
        this.objCollider = this.getComponent(ObjCollider);

        this.sp.spriteFrame = this.itemFrames[0];
        this.sp.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    update(dt: number) {
        if (CC_EDITOR) return;
        
        this.curTime += (dt * 1000);
        let duration = this.itemFrameDisplayTimes[this.curFrameIndex];
        if (this.curTime >= duration) {
            this.curFrameIndex++;
            if (this.curFrameIndex >= this.itemFrames.length) this.curFrameIndex = 0;
            this.curTime = 0;

            this.sp.spriteFrame = this.itemFrames[this.curFrameIndex];
        }
    }
}
