// Global.js
// 全局定义
// lly 2017.12.12

window.EXECUTION_ORDER = {
    MovableObject: 1,
    TerrainCollision: 2,
    ObjCollision: 3,
    CameraCtrlr: 4
}

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
}