// Hero.ts
// 英雄：
// 控制影响的动作
// lly 2017.12.12

const {ccclass, property} = cc._decorator;

@ccclass
export default class Hero extends cc.Component {

    onLoad() {
        // init logic
        
    }

    // 动作

    // 移动 dir: 1向右 -1向左 0停止
    move(dir: number) {

    }

    // 冲刺 dir: 1向右 -1向左
    dash(dir: number) {

    }

    // 跳跃
    jump() {

    }

    // 使用（拾起药水>进入门>下跳）
    use() {

    }
}
