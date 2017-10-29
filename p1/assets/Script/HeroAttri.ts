// HeroAttri.ts
// 主角的属性，Hp之类的
// lly 2017.10.22

const {ccclass, property} = cc._decorator;
import {MyEvent, MyName} from './ConstValue'

@ccclass
export default class HeroAttri extends cc.Component {

    hp: number = 100;
    isHurting: boolean = false;

    // 受伤后无敌时间
    invincibleTime: number = 1;

    onLoad() {
        this.initEvent();       
    }

    initEvent() {
        cc.systemEvent.on(MyName(MyEvent.colide), this.handleColide, this);
    }

    handleColide() {
        if (this.isHurting) return;
        this.isHurting = true;

        this.hp -= 10;
        cc.log("now hp: ", this.hp);
     
        if (this.hp <= 0) {
            this.sendEvent(MyEvent.dead);
        } else {
            this.sendEvent(MyEvent.hurt);
            this.scheduleOnce(function () {
                this.sendEvent(MyEvent.hurtEnd);
                this.isHurting = false;
            }, this.invincibleTime)
        }
    }

    sendEvent(e: MyEvent) {
        cc.systemEvent.emit(MyName(e));
    }
}
