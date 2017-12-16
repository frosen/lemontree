// Collision.ts
// 碰撞组件
// 拥有此组件的单位会进行碰撞检测
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

@ccclass
export default class Collision extends cc.Component {

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    }
    
    onDisabled() {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    }

    onCollisionEnter(other, mine) {
        this.node.color = cc.Color.RED;
        
        // 1st step 
        // get pre aabb, go back before collision
        var otherAabb = other.world.aabb;
        var otherPreAabb = other.world.preAabb.clone();

        var selfAabb = mine.world.aabb;
        var selfPreAabb = mine.world.preAabb.clone();

        // 2nd step
        // forward x-axis, check whether collision on x-axis
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if (this.speed.x < 0 && (selfPreAabb.xMax > otherPreAabb.xMax)) {
                this.node.x = otherPreAabb.xMax - this.node.parent.x;
                this.collisionX = -1;
            }
            else if (this.speed.x > 0 && (selfPreAabb.xMin < otherPreAabb.xMin)) {
                this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
                this.collisionX = 1;
            }

            this.speed.x = 0;
            other.touchingX = true;
            return;
        }

        // 3rd step
        // forward y-axis, check whether collision on y-axis
        selfPreAabb.y = selfAabb.y;
        otherPreAabb.y = otherAabb.y;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if (this.speed.y < 0 && (selfPreAabb.yMax > otherPreAabb.yMax)) {
                this.node.y = otherPreAabb.yMax - this.node.parent.y;
                this.jumping = false;
                this.collisionY = -1;
            }
            else if (this.speed.y > 0 && (selfPreAabb.yMin < otherPreAabb.yMin)) {
                this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
                this.collisionY = 1;
            }
            
            this.speed.y = 0;
            other.touchingY = true;
        }    
        
    }
    
    onCollisionStay(other, mine) {

    }
    
    onCollisionExit(other) {

    }
}