// DebuffComp.ts
// 可以带减损效果的组件
// lly 2018.8.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import {Debuff} from "./Debuff";

@ccclass
export default class DebuffComp extends MyComponent {

    /** 当前减损效果，每个单位同一时间只能有一个减损效果 */
    curDebuff: Debuff = null;

    curTime: number = 0;
    curSecond: number = 0;

    update(dt: number) {
        if (!this.curDebuff) return;
        
        this.curTime += dt;

        if (this.curTime > this.curDebuff.duration) {
            this.curDebuff.end(this);
            this.curDebuff = null;
        } else {
            let second = Math.floor(this.curTime);
            if (second > this.curSecond) {
                this.curSecond = second;
                this.curDebuff.update(this); // 每秒一跳
            }   
        }
    }

    setDebuff(debuff: Debuff) {
        if (debuff == this.curDebuff) return;

        if (this.curDebuff) {
            this.curDebuff.end(this);
        }

        this.curDebuff = debuff;
        this.curTime = 0;
        this.curSecond = 0;

        this.curDebuff.begin(this);
    }
}
