// PotFragmentCtrlr.ts
// 水罐碎片管理器，水罐就是场景中的可破坏物：
// lly 2018.5.12

const {ccclass, property} = cc._decorator;

import MyNodePool from "./MyNodePool";
import {MovableObject} from "./MovableObject";
import Gravity from "./Gravity";

const fragDirs: number[][] = [
    [0, 1], [0.7, 0.7], [1, 0], [0.7, -0.7], 
    [0, -1], [-0.7, -0.7], [-1, 0], [-0.7, 0.7],
    [0, 1], [1, 0], [-1, 0], [0, -1]
];
const speedRate: number = 1;
const initYSpeed: number = 0.2;

@ccclass
export default class PotFragmentCtrlr extends cc.Component {

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

    /**
     * 在相应位置显示场景破坏物打碎碎片的效果
     */
    showFragments(pos: cc.Vec2, color1: cc.Color, color2: cc.Color) {
        let fragCount = Math.floor(Math.random() * 4) + 8;

        let flip: number = 1;
        for (let index = 0; index < fragCount; index++) {
            let typeNum = Math.random();
            let type = typeNum < 0.4 ? 0 : (typeNum < 0.75 ? 1 : 2);

            let colorNum = Math.random();
            let color = colorNum < 0.75 ? color1 : color2;

            let dirInfo = fragDirs[index];
            let x = (dirInfo[0] + Math.random()) * speedRate;
            let y = (dirInfo[1] + Math.random()) * speedRate + initYSpeed;

            let r = (3600 + index * 300) * flip;
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

            node.runAction(cc.sequence(
                cc.rotateBy(4, r),
                cc.callFunc(() => {
                    this.pool.reclaim(node);
                })
            ))
        }
    }
}
