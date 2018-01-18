// ObjCollisionForHero.ts
// 对象碰撞
// 对象碰撞就是英雄，敌人以及相应武器法术之间的碰撞
// lly 2018.1.13

const {ccclass, property, requireComponent, executionOrder} = cc._decorator;

@ccclass
@requireComponent(cc.BoxCollider)
@executionOrder(EXECUTION_ORDER.ObjCollision) // 在地形碰撞后在检测
export default class ObjCollisionForHero extends cc.Component {

    /** 碰撞数量，大于0表示有碰撞 */
    collidingCount: number = 0;

    /** 最后一次碰撞的节点 */
    lastCollisionNode: cc.Node = null;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
    }

    onCollisionEnter(other, self) {
        let group: string = other.node.group;
        if (group == "enemy" || group == "enemyAtk") {
            this.collidingCount += 1;
            this.lastCollisionNode = other.node;
        }
    }

    onCollisionExit(other, self) {
        let group: string = other.node.group;
        if (group == "enemy" || group == "enemyAtk") {
            this.collidingCount -= 1;
        }
    }

    getIfCollide(): boolean {
        return this.collidingCount > 0;
    }

    getCollisionXDir(): number {
        return this.node.x < this.lastCollisionNode.x ? 1 : -1;
    }
}