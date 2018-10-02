// PotFragmentCtrlr.ts
// 水罐碎片管理器，水罐就是场景中的可破坏物：
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import MyNodePool from "./MyNodePool";
import {MovableObject} from "./MovableObject";
import Gravity from "./Gravity";

const fragDirs: number[][] = [
    [0, 1], [0.7, 0.7], [1, 0], [0.7, -0.7],
    [0, -1], [-0.7, -0.7], [-1, 0], [-0.7, 0.7],
    [0, 1], [1, 0], [-1, 0], [0, -1]
];
const speedRate: number = 3.5;
const initYSpeed: number = 2;

@ccclass
export default class PotFragmentCtrlr extends MyComponent {

    @property([cc.SpriteFrame])
    fragmentFrames: cc.SpriteFrame[] = [];

    pool: MyNodePool = null;

    onLoad() {
        // 生成节点池
        this.pool = new MyNodePool((): cc.Node => {
            let node = new cc.Node();
            node.addComponent(cc.Sprite);
            node.addComponent(MovableObject);
            node.addComponent(Gravity);
            return node;
        }, 60, "fragment", this.node);
    }

    // t: number = 1;
    // update(dt: number) {
    //     this.t += dt;
    //     if (this.t > 3) {
    //         this.t-= 3;
    //         this.showFragments(cc.v2(200, 200), cc.hexToColor("96412A"), cc.hexToColor("632518"));
    //     }
    // }

    /**
     * 在相应位置显示场景破坏物打碎碎片的效果
     */
    showFragments(pos: cc.Vec2, color1: cc.Color, color2: cc.Color) {
        let fragCount = Math.floor(Math.random() * 4) + 8;

        let flip: number = 1;
        for (let index = 0; index < fragCount; index++) {
            let typeNum = Math.random();
            let type =
                typeNum < 0.15 ? 0 :
                (typeNum < 0.5 ? 1 :
                (typeNum < 0.8 ? 2 : 3));

            let colorNum = Math.random();
            let color = colorNum < 0.75 ? color1 : color2;

            let dirInfo = fragDirs[index];
            let x = (dirInfo[0] + Math.random()) * speedRate;
            let y = (dirInfo[1] + Math.random()) * speedRate + initYSpeed;

            let r = index * 30;
            let rt = (2400 + index * 100) * flip;
            flip *= -1;

            // 生成
            let node = this.pool.get();
            let sp = node.getComponent(cc.Sprite);
            sp.spriteFrame = this.fragmentFrames[type];

            node.color = color;
            node.position = pos;

            let mobj = node.getComponent(MovableObject);
            mobj.xVelocity = x;
            mobj.yVelocity = y;

            node.rotation = r;

            node.runAction(cc.sequence(
                cc.rotateBy(4, rt),
                cc.callFunc(() => {
                    this.pool.reclaim(node);
                })
            ))
        }
    }
}
