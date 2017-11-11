// AimPosIndicator.ts
// 英雄目标位置指示
// lly 2017.10.22

const {ccclass, property, requireComponent} = cc._decorator;
import Hero from './Hero'

@ccclass
@requireComponent(cc.Sprite)
export default class AimPosIndicator extends cc.Component {

    @property(Hero)
    hero: Hero = null;

    isShowing: boolean = false;

    onLoad() {
        this.node.opacity = 0;
    }

    update() {
        this.checkHeroPosAndSetIndicatorPos();
        this.showIndicator();
    }

    checkHeroPosAndSetIndicatorPos() {
        let aimPos = this.hero.getAimPosOrNull();
        if (!aimPos) {
            this.isShowing = false;
            return;
        }

        let {aimX, aimY} = aimPos;
        this.node.position = new cc.Vec2(aimX, aimY); 
        
        if (Math.abs(this.hero.node.x - aimX) < 1 && Math.abs(this.hero.node.y - aimY) < 1) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
    }

    showIndicator() {
        let addOp = this.isShowing ? 10 : -10;
        let aimOp = this.node.opacity + addOp;
        aimOp = Math.max(0, aimOp);
        aimOp = Math.min(255, aimOp);
        this.node.opacity = aimOp;
    }
}
