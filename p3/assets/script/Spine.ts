// Spine.ts
// 尖刺陷阱什么的，有attack能力，但是不会被attack：
// lly 2018.8.27

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";
import { Attri } from "./Attri";

@ccclass
export default class Spine extends MyComponent {

    onLoad() {
        let attri = this.getComponent(Attri);
        attri.atkDmg.set(20);
    }

    reset() {
        
    }
}
