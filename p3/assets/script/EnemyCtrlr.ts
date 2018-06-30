// EnemyCtrlr.ts
// 敌人控制器
// lly 2018.6.27

const {ccclass, property} = cc._decorator;

@ccclass
export default class EnemyCtrlr extends cc.Component {

    onLoad() {
        cc.loader.loadResDir("enemy/scene1", cc.Prefab, (error: Error, prefabs: cc.Prefab[], urls: string[]) => {
            if (error) {
                cc.log(`Wrong in load res dir: ${error.message}`);
                return;
            }

            cc.log(">>", "enemey", prefabs.length);
            for (const prefab of prefabs) {
                cc.log(">>", "prefab", prefab.name);
            }
        });
    }

    // update (dt) {}
}
