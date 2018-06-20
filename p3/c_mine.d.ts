// 自定义 -------------------

/**
 * 定义了脚本执行顺序，
 * 可移动对象组件要在其他组件之后，碰撞组件之前执行
 * 碰撞组件要在所有之后，因为要计算最终位置的碰撞
 */
declare namespace EXECUTION_ORDER {
	let MovableObject: number // = 1
	let TerrainCollider: number
	let ObjCollider: number
	let BehaviorTree: number
	let CameraCtrlr: number
	let BGCtrlr: number
}

/**
 * 根据字符串查找一个function，字符串用":"区分组件名和函数名
 */
declare function getFuncFromString(obj: Object, str: string): function;

/**
 * 按照list列表依次执行，执行的this是obj
 */
declare function callList(obj: any, list: any[])

/**
 * 官方还没有对多个组件的需求，所以自己先弄一个
 */
declare function requireComponents(obj: Object, components: any[]): void;

/**
 * cc.assert会飘红，用一个新方法替代
 */
declare function myAssert(condition: any, log: string): void;

/**
 * 获取一个类的名字
 */
declare function getClassName(type: {new()}): string;

/**
 * 获取当前位置的行数，函数名等调试信息的字符串
 */
declare function curLineInfo(): string;
