// Debuff.ts
// 减损效果
// lly 2018.8.12

import DebuffComp from "./DebuffComp";
import FigureDisplay from "./FigureDisplay";
import {Attri} from "./Attri";
import ColorComp from "./ColorComp";

const DebuffKey = "Debuff";

export class Debuff {

    duration: number;

    constructor(duration: number) {
        this.duration = duration;
    }

    begin(comp: DebuffComp) {}

    update(comp: DebuffComp) {}

    end(comp: DebuffComp) {
        this.changeColor(null, comp);
    }

    changeColor(color: cc.Color, comp: DebuffComp) {
        let colorComp: ColorComp = comp.getComponent(ColorComp);
        if (color)
            colorComp.setColor("debuff", color);
        else
            colorComp.removeColor("debuff");
    }
}

/** 中毒效果 */
export class Poisoning extends Debuff {

    damage: number;
    figureDisplay: FigureDisplay;

    constructor(damage: number, duration: number) {
        super(duration);
        this.damage = damage;
        this.figureDisplay = cc.find("main/figure_layer").getComponent(FigureDisplay);
    }

    begin(comp: DebuffComp) {
        this.changeColor(cc.color(100, 255, 150, 255), comp);
    }

    update(comp: DebuffComp) {
        this.wound(comp);
    }

    wound(comp: DebuffComp) {
        let attri = comp.getComponent(Attri);
        let hp = Math.max(attri.hp.get() - this.damage, 1);
        attri.hp.set(hp);

        let node = comp.node;
        let xCenter = node.x + node.width * (0.5 - node.anchorX);
        let yCenter = node.y + node.height * (0.5 - node.anchorY);
        this.figureDisplay.showFigure(cc.v2(xCenter, yCenter), 0, this.damage, false, cc.Color.GREEN);
    }
}

/** 冰冻效果 */
const FrozenAttriKey = "Frozen";
export class Frozen extends Debuff {
    begin(comp: DebuffComp) {
        this.changeColor(cc.color(150, 80, 255, 255), comp);
        let attri = comp.getComponent(Attri);
        attri.addModificationCall(DebuffKey, FrozenAttriKey, (a: Attri) => {
            a.xSpeed.multiply(0.7);
            a.ySpeed.multiply(0.7);
        });
        attri.reset();
    }

    end(comp: DebuffComp) {
        super.end(comp);
        let attri = comp.getComponent(Attri);
        attri.removeModificationCall(DebuffKey, FrozenAttriKey);
        attri.reset();
    }
}

/** 诅咒效果 */
const CurseAttriKey = "Curse";
export class Curse extends Debuff {
    begin(comp: DebuffComp) {
        this.changeColor(cc.color(209, 43, 231, 255), comp);
        let attri = comp.getComponent(Attri);
        attri.addModificationCall(DebuffKey, CurseAttriKey, (a: Attri) => {
            a.atkDmg.multiply(0.5);
            a.magicDmg.multiply(0.5);
        });
        attri.reset();
    }

    end(comp: DebuffComp) {
        super.end(comp);
        let attri = comp.getComponent(Attri);
        attri.removeModificationCall(DebuffKey, CurseAttriKey);
        attri.reset();
    }
}