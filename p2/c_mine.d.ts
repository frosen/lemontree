// 自定义 -------------------

/**
 * 定义了脚本执行顺序，
 * 可移动对象组件要在其他组件之后，碰撞组件之前执行
 * 碰撞组件要在所有之后，因为要计算最终位置的碰撞
 */
declare namespace EXECUTION_ORDER {
	let MovableObject: number
	let TerrainCollision: number
	let ObjCollision: number
	let CameraCtrlr: number
}