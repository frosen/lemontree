// Debuff.ts
// 减损效果
// lly 2018.8.12

import DebuffComp from "./DebuffComp";
import FigureDisplay from "./FigureDisplay";
import {Attri} from "./Attri";
import ColorComp from "./ColorComp";

export class Debuff {

    duration: number;

    constructor(duration: number) {
        this.duration = duration;
    }

    begin(comp: DebuffComp): {} {return null}

    update(comp: DebuffComp) {}

    end(comp: DebuffComp, deduction: {}) {
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

    begin(comp: DebuffComp): {} {
        this.changeColor(cc.color(100, 255, 150, 255), comp);
        return null;
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
export class Frozen extends Debuff {

    begin(comp: DebuffComp): {} {
        this.changeColor(cc.color(150, 80, 255, 255), comp);
        let attri = comp.getComponent(Attri);
        let xDeduction = attri.xSpeed.get() * 0.3;
        let yDeduction = attri.ySpeed.get() * 0.3;
        attri.xSpeed.sub(xDeduction);
        attri.ySpeed.sub(yDeduction);
        return {
            x: xDeduction,
            y: yDeduction
        };
    }

    end(comp: DebuffComp, deduction: {x: number, y: number}) {
        super.end(comp, deduction);
        let attri = comp.getComponent(Attri);
        attri.xSpeed.add(deduction.x);
        attri.ySpeed.add(deduction.y);
    }
}

/** 诅咒效果 */
export class Curse extends Debuff {
    begin(comp: DebuffComp): {} {
        this.changeColor(cc.color(209, 43, 231, 255), comp);
        let attri = comp.getComponent(Attri);

        let aDeduction = attri.atkDmg.get() * 0.5;
        let mDeduction = attri.magicDmg.get() * 0.5;
        attri.atkDmg.sub(aDeduction);
        attri.magicDmg.sub(mDeduction);
        return {
            a: aDeduction,
            m: mDeduction
        };
    }

    end(comp: DebuffComp, deduction: {a: number, m: number}) {
        super.end(comp, deduction);
        let attri = comp.getComponent(Attri);
        attri.atkDmg.sub(deduction.a);
        attri.magicDmg.sub(deduction.m);
    }
}