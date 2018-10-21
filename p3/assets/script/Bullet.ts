// Bullet.ts
// 这是一个和英雄或敌人放在同一层的节点，又英雄/敌人生成
// 自己本身也可以是英雄/敌人，也可以仅仅是子弹
// lly 2018.10.7

const {ccclass, property} = cc._decorator;

import {Attri} from "./Attri";
import Attack from "./Attack";
import MyNodePool from "./MyNodePool";

@ccclass
export default class Bullet extends cc.Component {

    /** 子敌人（子弹什么的） */
    @property([cc.Prefab]) bulletPrefabs: cc.Prefab[] = [];
    /** 子敌人的最大数量 */
    @property([cc.Integer]) bulletsMaxCount: number[] = [];
    /** 子敌人 */
    bullets: {[name: string]: MyNodePool;} = {};

    needInitAttri: boolean = true;

    parent: cc.Node = null;
    thisPool: MyNodePool = null;

    onLoad() {

    }

    init(parent: cc.Node, pool: MyNodePool, attri: Attri, data: any) {
        this.parent = parent;
        this.thisPool = pool;

        let atks = this.getComponentsInChildren(Attack);
        for (const atk of atks) {
            atk.attri = attri;
        }

        this.initSubBullet(attri, data);
    }

    reset(data: any) {
        this.resetSubBullet(data);
    }

    clear(data: any) {
        this.clearSubBullet(data);
    }

    // 子子弹 ===========================================================

    initSubBullet(attri: Attri, data: any) {
        for (let index = 0; index < this.bulletPrefabs.length; index++) {
            let prefab = this.bulletPrefabs[index];
            let maxCount = this.bulletsMaxCount[index];
            let name = prefab.name;
            let pool = new MyNodePool((pool: MyNodePool): cc.Node => {
                let node = cc.instantiate(prefab);
                let bullet = node.getComponent(Bullet);
                bullet.init(this.parent, pool, attri, data);
                return node;
            }, maxCount, this.name + "sub", this.parent, Bullet);
            this.bullets[name] = pool;
        }
    }

    resetSubBullet(data: any) {
        for (const name in this.bullets) {
            let bulletPool: MyNodePool = this.bullets[name];
            bulletPool.eachComp((bullet: Bullet, using: boolean) => {
                bullet.reset(data);
                bullet.clear(data);
                bullet.reclaimThisBullet();
            });
        }
    }

    clearSubBullet(data: any) {
        for (const name in this.bullets) {
            let bulletPool: MyNodePool = this.bullets[name];
            bulletPool.eachComp((bullet: Bullet, using: boolean) => {
                bullet.clear(data);
                bullet.reclaimThisBullet();
            });
        }
    }

    getSubBullet(name: string): Bullet {
        return this.bullets[name].getComp();
    }

    reclaimThisBullet() {
        this.thisPool.reclaim(this.node);
    }


}
