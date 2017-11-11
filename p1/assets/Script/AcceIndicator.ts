// AcceIndicator.ts
// 加速方向指示器，用UI显示当前加速器数据，便于用户控制
// lly 2017.10.31

const {ccclass, property, requireComponent, executeInEditMode} = cc._decorator;

import AcceDirCtrler from './AcceDirCtrler'
import {Direction} from './ConstValue'

enum DrawState {
    end,
    begin,
    drawing,
}

@ccclass
@requireComponent(cc.Graphics)
@executeInEditMode
export default class AcceIndicator extends cc.Component {

    @property(AcceDirCtrler)
    acce: AcceDirCtrler = null;

    @property
    drawRadius: number = 80;

    @property(cc.SpriteFrame)
    coordinateFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    coordinatePauseFrame: cc.SpriteFrame = null;

    rangeGraphics: cc.Graphics = null;
    coordinate: cc.Sprite = null;

    drawState: DrawState = DrawState.end; // 是否在绘制中

    onLoad() {
        this.rangeGraphics = this.getComponent(cc.Graphics);
        
        this.coordinate = this.getComponentInChildren(cc.Sprite);
        this.coordinate.enabled = false; // 先不显示
        
        this.showForDebug();
    }

    showForDebug() {
        if (cc.sys.os == cc.sys.OS_OSX) {
            this.rangeGraphics.circle(0, 0, this.drawRadius);
            this.rangeGraphics.stroke();
        }
    }

    update() {
        let {x, y} = this.acce.getAcceData();
        if (x < -99) {
            this.endDraw();
            return;
        }

        // 绘制范围
        this.drawRange();
        
        // 根据加速度绘制加速坐标和方向
        this.drawAcceCoordinate();   
    }

    drawRange() {
        if (this.drawState != DrawState.end) return;
        this.drawState = DrawState.begin;
        this.rangeGraphics.clear();
        this.rangeGraphics.circle(0, 0, this.drawRadius);
        this.rangeGraphics.stroke();
        this.node.scale = 0.2;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.scaleTo(0.1, 1),
            cc.callFunc(() => {
                this.drawState = DrawState.drawing;
            })
        ))
    }

    lastDir: Direction = Direction.Dnone;
    passTimes: number = 0;
    moveX: number = 0;
    moveY: number = 0;
    PASS_TIME: number = 10;
    drawAcceCoordinate() {
        if (this.drawState != DrawState.drawing) return;
        this.coordinate.enabled = true;

        let {x, y, dir} = this.acce.getAcceData();

        if (this.lastDir != dir) {
            this.coordinate.node.x = x;
            this.coordinate.node.y = y;
            this.moveX = 0;
            this.moveY = 0;
            this.lastDir = dir;
            return;
        }
        
        if (this.passTimes > 0) {
            this.passTimes -= 1;
            this.moveCoordinate();
            return;
        }
        this.passTimes = this.PASS_TIME;

        // 坐标不同方向的显示
        if (dir == Direction.Dnone) {
            this.coordinate.spriteFrame = this.coordinatePauseFrame;
            this.coordinate.node.rotation = 0;
        } else {
            this.coordinate.spriteFrame = this.coordinateFrame;
            let rotation: number = 0;
            switch (dir) {
                case Direction.D0:   rotation = 0;   break;
                case Direction.D45:  rotation = 45;  break;
                case Direction.D90:  rotation = 90;  break;
                case Direction.D135: rotation = 135; break;
                case Direction.D180: rotation = 180; break;
                case Direction.D225: rotation = 225; break;
                case Direction.D270: rotation = 270; break;
                case Direction.D315: rotation = 315; break;
                default: break;
            }
            this.coordinate.node.rotation = rotation;
        }  

        // 移动坐标到相应的位置       
        let pauseRange = this.acce.getPausePrecision();

        let rate = this.drawRadius / pauseRange;
        let maxR = this.drawRadius * 3;
        let xDraw = x * rate;
        let yDraw = y * rate;

        let aimX: number = 0;
        let aimY: number = 0;
        let r2 = xDraw * xDraw + yDraw * yDraw
        if (r2 <= maxR * maxR) {
            aimX = xDraw;
            aimY = yDraw;
        } else {
            let r = Math.pow(r2, 0.5);
            aimX = xDraw * maxR / r;
            aimY = yDraw * maxR / r;
        } 
        
        let oriX = this.coordinate.node.x;
        let oriY = this.coordinate.node.y;

        this.moveX = (aimX - oriX) / this.PASS_TIME;
        this.moveY = (aimY - oriY) / this.PASS_TIME;

        this.moveCoordinate();
    }

    moveCoordinate() {
        this.coordinate.node.x += this.moveX;
        this.coordinate.node.y += this.moveY;
    }

    endDraw() {
        if (this.drawState == DrawState.end) return;
        
        this.coordinate.node.x = 0;
        this.coordinate.node.y = 0;
        this.coordinate.enabled = false;
        this.passTimes = 0;

        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.scaleTo(0.1, 0.2),
            cc.callFunc(() => {
                this.rangeGraphics.clear();
            })
        ))
        
        this.drawState = DrawState.end;
    }

    
}
