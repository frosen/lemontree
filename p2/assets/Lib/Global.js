// Global.js
// 全局定义
// lly 2017.12.12

window.EXECUTION_ORDER = {
    MovableObject: 1,
    TerrainCollider: 2,
    ObjCollider: 3,
    BehaviorTree: 4,
    CameraCtrlr: 5
};

window.getFuncFromString = function (obj, str) {
    let data = str.split(":");
    let comp = obj.getComponent(data[0]);
    cc.assert(comp, "When get func: " + obj.name + " wrong component: " + data[0]);
    let func = comp[data[1]];
    cc.assert(func && typeof(func) == "function", data[0] + " wrong component function: " + data[1]);
    return func.bind(comp);
};

window.requireComponents = function (obj, components) {
    let t = true;
    let s = ""
    for (let index = 0; index < components.length; index++) {
        const component = components[index];
        let has = !!obj.getComponent(component);
        t = t && has;
        if (!has) {
            s += (component.name + ",");
        }
    }
    cc.assert(t, "[" + obj.name + "] need component: " + s);
};

window.myAssert = cc.assert;

window.getClassName = function (func) {
    return func.name;
}

window.curLineInfo = function () {
    try {
        throw new Error();
    } catch (e) {
        return e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
    }
}