// ColorComp.ts
// 颜色控制组件，解决颜色冲突的问题，可以控制自己及子节点所有的精灵
// lly 2018.8.12

const {ccclass, property} = cc._decorator;

import MyComponent from "./MyComponent";

@ccclass
export default class ColorComp extends MyComponent {

    /** 所有带有精灵的节点 */
    allSpNodes: cc.Node[] = [];

    colorDict: {[key: string]: cc.Color} = {};

    resetSp() {
        // 获取精灵节点
        let allSps = this.getComponentsInChildren(cc.Sprite);
        for (const sp of allSps) {
            this.allSpNodes.push(sp.node);
        }
    }

    resetColor() {
        let r = 0, g = 0, b = 0, l = 0;
        for (const key in this.colorDict) {
            const color = this.colorDict[key];
            r += color.getR();
            g += color.getG();
            b += color.getB();
            l++;
        }

        if (l != 0) {
            r /= l;
            g /= l;
            b /= l;
        }

        let realColor = cc.color(255 - r, 255 - g, 255 - b, 255);
        for (const spNode of this.allSpNodes) {
            spNode.color = realColor;
        }
    }

    setColor(key: string, c: cc.Color) {
        this.colorDict[key] = cc.color(255 - c.getR(), 255 - c.getG(), 255 - c.getB(), 255);
        this.resetColor();
    }

    removeColor(key: string) {
        delete this.colorDict[key];
        this.resetColor();
    }
}
