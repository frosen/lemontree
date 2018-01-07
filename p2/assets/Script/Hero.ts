// Hero.ts
// 英雄：
// 英雄的主类，进行多个组件的交互
// lly 2017.12.12

const {ccclass, property, requireComponent} = cc._decorator;

import MovableObject from "./MovableObject";
import TerrainCollision from "./TerrainCollision";

import AttriForHero from "./AttriForHero";
import HeroUI from "./HeroUI";

import {ActState, StateForHero} from "./StateForHero";

@ccclass
@requireComponent(MovableObject)
@requireComponent(TerrainCollision)
export default class Hero extends cc.Component {

    /** 可移动对象组件 */
    movableObj: MovableObject = null;
    /** 地形碰撞组件 */
    terrainCollision: TerrainCollision = null;

    /** 英雄属性 */
    attri: AttriForHero = null;
    /** 英雄UI */
    ui: HeroUI = null;

    /** 英雄状态 */
    state: StateForHero = null;

    /** x轴移动方向 */
    xDir: number = 0;

    onLoad() {
        this.movableObj = this.getComponent(MovableObject);
        this.terrainCollision = this.getComponent(TerrainCollision);

        this.attri = new AttriForHero();
        this.ui = this.getComponent(HeroUI);

        StateForHero.init(this, ActState.stand);
    }

    update(dt: number) {
        StateForHero.machineUpdate(dt);
    }

    lateUpdate() {
        StateForHero.machineCheck();
    }

    // 动作 被控制器调用 -------------------------------------------------
 
    /**
     * 移动
     * @param dir: 1向右 -1向左 0停止
     */
    move(dir: number) {
        this.xDir = dir;
    }

    /**
     * 冲刺
     */
    dash() {
        StateForHero.changeStateTo(ActState.dash);
    }

    /**
     * 跳跃，通过加速时间不同，可控制跳跃高度
     * @param accelerating: true开始跳跃速度，false结束速度开始自由落体
     */
    jump(accelerating: boolean) {
        if (accelerating) {
            StateForHero.changeStateTo(ActState.jumpAccelerating);
        } else {
            if (StateForHero.curState == ActState.jumpAccelerating) {
                StateForHero.changeStateTo(ActState.jump);
            }
        }
    }

    /**
     * 使用（拾起药水>进入门>下跳）
     */
    use() {
        this.node.y -= 2;
    }

    // 被状态机调用 ------------------------------------------------------------
}
