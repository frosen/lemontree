// Collision.ts
// 主角与子弹的碰撞检测，还有擦弹
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

@ccclass
export default class NewClass extends cc.Component {

    // 注意：请确保主角和子弹的position相同时，两者的位置是重叠的
    @property(cc.Node)
    hero: cc.Node = null;

    // 子弹层，层中所有的node都视为子弹
    @property(cc.Node)
    bulletLayer: cc.Node = null;

    @property(cc.Size)
    heroSize: cc.Size = new cc.Size(0, 0);

    onLoad() {

    }

    update() {
        for (let bullet of this.bulletLayer.children) {
            let {bWidth, bHeight} = this.getBulletSizeByTag(bullet.tag);
            this.checkBullet(bullet.x, bullet.y, bWidth, bHeight);
        } 
    }

    // 根据tag生产子弹的碰撞体积
    getBulletSizeByTag(tag: number): {bWidth: number, bHeight: number} {
        return {
            bWidth: 10, bHeight: 10
        }
    }

    // 检测子弹位置
    checkBullet(bx: number, by: number, bw: number, bh: number) {
        let hx: number = this.hero.x;
        let hw: number = this.heroSize.width;
        let hy: number = this.hero.y;
        let hh: number = this.heroSize.height;

        let isContains: boolean = !(
            bx + bw < hx - hw ||
            bx - bw > hx + hw ||
            by + bh < hy - hh ||
            by - bh > hy + hh
        )

        if (isContains) {
            this.sendHurt();
        }
    }

    sendHurt() {
        cc.systemEvent.emit(MyName(MyEvent.colide));
    }
}
