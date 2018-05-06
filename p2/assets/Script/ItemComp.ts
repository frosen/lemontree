// ItemComp.ts
// 道具组件，因为item为道具核心，所以组件叫做道具组件：
// lly 2018.4.12

const {ccclass, property} = cc._decorator;
const sch = cc.director.getScheduler();

import Item from "./Item";
import ItemCtrlr from "./ItemCtrlr";

import {MovableObject} from "./MovableObject";
import TerrainCollider from "./TerrainCollider";
import {CollisionType} from "./TerrainCtrlr";
import {ObjCollider, CollisionData} from "./ObjCollider";
import ObjColliderForWatch from "./ObjColliderForWatch";
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
    /** 观察者组件 */
    watchCollider: ObjColliderForWatch = null;

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
    /** 是否在跳跃（触地反弹）中 */
    jumping: boolean = false;
    /** 是否进行观察（自动收集） */
    watching: boolean = false;
    /** 飞向的目标节点 */
    aim: cc.Node = null;
    /** 飞行速度 */
    flySpeed: number = 1;

    onLoad() {
        this.sp = this._createComp(cc.Sprite);
        this.movableObj = this._createComp(MovableObject);
        this.terrainCollider = this._createComp(TerrainCollider);
        this.objCollider = this._createComp(ObjCollider);
        this.watchCollider = this._createComp(ObjColliderForWatch);
        this._createComp(Gravity);

        this.watchCollider.size = cc.size(270, 270);
        this.watchCollider.callback = this.onWatching.bind(this);
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
        this.curTime += dt * sch.getTimeScale() * 1000;
        let duration = this.itemFrameDisplayTimes[this.curFrameIndex];
        if (this.curTime >= duration) {
            this.curFrameIndex++;
            if (this.curFrameIndex >= this.itemFrames.length) this.curFrameIndex = 0;
            this.curTime = 0;

            this.sp.spriteFrame = this.itemFrames[this.curFrameIndex];
        }
    }

    lateUpdate() {
        if (this.aim) {
            this._flyToAim();
            return;
        }

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

    _flyToAim() {
        let x = this.aim.x - this.node.x;
        let y = this.aim.y - this.node.y;
        let l = Math.sqrt(x * x + y * y);
        let lr = this.flySpeed * 0.5;
        this.flySpeed++;
        let rate = lr / l;
        let xr = x * rate;
        let yr = y * rate;
        this.node.x += xr;
        this.node.y += yr;
    }

    setData(core: Item, frames: cc.SpriteFrame[], displayTimes: number[]) {
        this.itemCore = core;
        this.itemFrames = frames;
        this.itemFrameDisplayTimes = displayTimes;

        this.curFrameIndex = 0;
        this.curTime = 0;

        this.sp.spriteFrame = this.itemFrames[this.curFrameIndex];
        this.sp.sizeMode = cc.Sprite.SizeMode.RAW;

        let oSize = this.sp.spriteFrame.getOriginalSize();
        this.terrainCollider.size = cc.size(oSize.width - 4, oSize.height); // 碰撞的两边稍微往里，为的是在斜面上不会看起来浮空
    }

    move(x: number, y: number) {
        this.movableObj.xVelocity = x;
        this.movableObj.yVelocity = y;
        this.jumping = true;

        this.movableObj.enabled = true;
        this.terrainCollider.enabled = true;

        this.objCollider.enabled = false;
        this.watchCollider.enabled = false;

        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.objCollider.enabled = true;

                // 检测是否需要观察
                if (this.watching) {
                    this.watchCollider.enabled = true;
                }
            })
        ));
    }

    onCollision() {
        // 此时的item不能再被碰到
        this.movableObj.enabled = false;
        this.terrainCollider.enabled = false;
        this.objCollider.enabled = false;
        this.watchCollider.enabled = false;
        this.aim = null;

        // 动效
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.moveBy(0.3, 0, 100).easing(cc.easeSineOut()),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.itemCtrlr.removeItem(this);
            })
        ))
    }

    // 开启自动收集后，只要观察到hero，会直接飞向hero，不会停止
    onWatching(collisionDatas: CollisionData[]) {
        if (this.aim == null) {
            for (const collisionData of collisionDatas) {
                let cldr = collisionData.cldr;
                if (cldr.constructor == ObjColliderForWatch) continue;
                let hero = cldr.getComponent("Hero");
                if (hero) {
                    this.aim = cldr.node;
                    this.flySpeed = 1;
                    this.terrainCollider.enabled = false;
                }   
            }            
        }    
    }
}
