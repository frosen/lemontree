// DebuffComp.ts
// 可以带减损效果的组件
// lly 2018.8.12

const {ccclass, property} = cc._decorator;

import {Debuff} from "./Debuff";

@ccclass
export default class DebuffComp extends cc.Component {

    /** 当前减损效果，每个单位同一时间只能有一个减损效果 */
    curDebuff: Debuff = null;

    curTime: number = 0;

    update(dt: number) {
        if (!this.curDebuff) return;
        
        this.curTime += dt;

        if (this.curTime >= this.curDebuff.duration) {
            this.curDebuff.end(this);
            this.curDebuff = null;
        } else {
            this.curDebuff.update(dt, this);
        }
    }

    getDebuff(debuff: Debuff) {
        if (this.curDebuff) {
            this.curDebuff.end(this);
        }

        this.curDebuff = debuff;
        this.curTime = 0;

        this.curDebuff.begin(this);
    }
}
