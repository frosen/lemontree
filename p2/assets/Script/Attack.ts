// Attack.ts
// 表示有伤害的对象：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;
import Attri from "./Attri";

@ccclass
export default class Attack extends cc.Component {

    /** 索引，用于区分不同的攻击 
     * 目前只是敌人的攻击需要，同种攻击在一定时间内不会伤害第二次，
     * hero被攻击有无敌时间所以不需要
     * 索引由indexNumber和indexRange组成
    */
    index: number = 0;

    /** 索引数字，用于组成索引 */
    @property indexNumber: number = 0;
    /** 索引范围，索引可以在这个范围内变化，不能超过9 */
    @property indexRange: number = 0;

    /** 对象属性，攻击计算需要 */
    @property(Attri)
    attri: Attri = null;

    onLoad() {
        this.index = this.indexNumber * 10;
        
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
    }
}
