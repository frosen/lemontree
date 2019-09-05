// SoundComp.ts
// 音频播放组件
// lly 2018.9

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundComp extends cc.Component {
    @property({
        type: [cc.AudioClip],
        displayName: '音效文件列表',
    })
    effects: cc.AudioClip[] = [];

    play(index: number = 0) {
        cc.audioEngine.playEffect(this.effects[index], false);
    }

    /** _占位event */
    playByBtn(_: any, index: number = 0) {
        cc.audioEngine.playEffect(this.effects[index], false);
    }
}
