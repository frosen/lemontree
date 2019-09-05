// ObjColliderForWatch.ts
// 和对象碰撞是一样，主要是负责检测某个节点的探知范围，用于其相应的反应动作
// 继承出一个新的类便于管理和引用，debug框的颜色与原有区别
// lly 2018.1.13

const { ccclass, property } = cc._decorator;

import { ObjCollider } from './ObjCollider';

@ccclass
export default class ObjColliderForWatch extends ObjCollider {
    _debugColor = cc.Color.YELLOW;
}
