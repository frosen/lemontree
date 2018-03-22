// Attack.ts
// 表示有伤害的对象：
// lly 2018.1.27

const {ccclass, property} = cc._decorator;

@ccclass
export default class Attack extends cc.Component {

    /** 索引，用于区分不同的攻击 
     * 目前只是敌人的攻击需要，同种攻击在一定时间内不会伤害第二次，
     * hero被攻击有无敌时间所以不需要
     * 对敌人的攻击分成普通攻击，特殊的普通攻击，魔法攻击
     * 普通攻击10以内往复，特殊攻击使用10到100的区间，魔法攻击使用100以上
    */
    index: number = 0;

    onLoad() {
        // init logic
        
    }
}
