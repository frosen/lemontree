// Bullet.ts
// 这是一个和英雄或敌人放在同一层的节点，又英雄/敌人生成
// 自己本身也可以是英雄/敌人，也可以仅仅是子弹
// lly 2018.10.7

const {ccclass, property} = cc._decorator;

import {Attri} from "./Attri";
import Attack from "./Attack";

@ccclass
export default class Bullet extends cc.Component {

    init(attri: Attri) {
        let atks = this.getComponentsInChildren(Attack);
        for (const atk of atks) {
            atk.attri = attri;
        }
    }

    reset(lv: number) {

    }

    clear() {

    }
}
