// Global.js
// 全局设置和定义
// lly 2017.12.12

// 全局设置========================================================

cc.view.enableAntiAlias(false);

// cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 1;
// cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL_TMX = 1;

// 全局定义========================================================

window.EXECUTION_ORDER = {
    MovableObject: 1,
    TerrainCollider: 2,
    ObjCollider: 3,
    BehaviorTree: 4,
    CameraCtrlr: 5,
    BGCtrlr: 6,
};

let scheduler = cc.director.getScheduler();
let schTarget = {};
window.callList = function(obj, list) {
    function handle(data = null) {
        let callInfo = list.shift();
        if (callInfo) {
            const [func, ...param] = callInfo;
            scheduler.schedule(
                function(_) {
                    func.call(obj, handle, data, ...param);
                },
                schTarget,
                0,
                0,
                0,
                false,
            );
        }
    }
    handle();
};

window.requireComponents = function(obj, components) {
    let t = true;
    let s = '';
    for (let index = 0; index < components.length; index++) {
        const component = components[index];
        let has = !!obj.getComponent(component);
        t = t && has;
        if (!has) {
            s += component.name + ',';
        }
    }
    cc.assert(t, '[' + obj.name + '] need component: ' + s);
};

window.getClassName = function(func) {
    return func.name;
};

window.curLineInfo = function() {
    try {
        throw new Error();
    } catch (e) {
        return e.stack
            .replace(/Error\n/)
            .split(/\n/)[1]
            .replace(/^\s+|\s+$/, '');
    }
};
