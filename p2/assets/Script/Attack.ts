// Attack.ts
// 表示有伤害的对象：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;
import {Attri} from "./Attri";

@ccclass
export default class Attack extends cc.Component {

    /** 索引，用于区分不同的攻击 
     * 目前只是敌人的攻击需要，同种攻击在一定时间内不会伤害第二次，
     * hero被攻击有无敌时间所以不需要
    */
    @property 
    index: number = 0;

    /** 对象属性，攻击计算需要 */
    @property(Attri)
    attri: Attri = null;

    @property
    magicAttack: boolean = false;

    @property
    hidingAtBeginning : boolean = false;

    onLoad() {        
        if (this.attri == null) {
            let n = this.node;
            while (true) {
                let attri = n.getComponent(Attri);
                if (attri != null) {
                    this.attri = attri;
                    break;
                } else {
                    n = n.parent;
                }
            }
        }
        myAssert(this.attri != null, "attack need attri");

        if (this.hidingAtBeginning) this.enabled = false;
    }

    // 计算基础伤害
    getDamage(): {dmg: number, crit: boolean} {
        let r = Math.random();
        let dmg: number;
        let crit: boolean = false;
        if (this.magicAttack) {
            dmg = this.attri.getMagicDmg();
            crit = r < this.attri.getMagicCritRate();
            if (crit) dmg *= this.attri.getMagicCritDmgRate();
        } else {
            dmg = this.attri.getAtkDmg();
            crit = r < this.attri.getCritRate();
            if (crit) dmg *= this.attri.getCritDmgRate();
        }

        // 伤害从0.8到1.2浮动
        let r2 = Math.random();
        let rate = 0.8 + r2 * 0.4;
        dmg *= rate;

        return {dmg, crit};
    }

    changeIndex() {
        this.index += 10000;
        if (this.index > 100000) this.index = this.index % 1000;
    }

    excuteHitCallback(node: cc.Node) {
        // llytodo
    }
}
