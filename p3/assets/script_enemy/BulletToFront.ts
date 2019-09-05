// BulletToFront.ts
// 向前发射的子弹
// lly 2018.10.7

const { ccclass, property } = cc._decorator;

import Bullet from '../script/Bullet';
import { MovableObject } from '../script/MovableObject';
import TerrainCollider from '../script/TerrainCollider';
import { CollisionType } from '../script/TerrainCtrlr';
import BulletForEffect from '../script/BulletForEffect';

const Speed: number = 6;

@ccclass
export default class BulletToFront extends Bullet {
    mobj: MovableObject = null;
    terrainCollider: TerrainCollider = null;

    onLoad() {
        super.onLoad();
        this.mobj = this.getComponent(MovableObject);
        this.terrainCollider = this.getComponent(TerrainCollider);
    }

    begin(dir: number) {
        this.mobj.xVelocity = dir * Speed;

        // 展示启动效果
        (this.getSubBullet('e_bulletToFrontBegin') as BulletForEffect).doEffectAt(this.node.position);
    }

    isBlocked() {
        return (
            this.terrainCollider.xOutRangeDir != 0 ||
            this.terrainCollider.curXCollisionType >= CollisionType.slope ||
            this.terrainCollider.curYCollisionType >= CollisionType.slope
        );
    }

    end() {
        this.reclaimThisBullet();

        // 展示爆炸
        (this.getSubBullet('e_bulletToFrontEnd') as BulletForEffect).doEffectAt(this.node.position);
    }
}
