// 自定义 -------------------

/**
 * 定义了脚本执行顺序，
 * 重力组件要在其他组件之前执行，因为其后还可以调整
 * 碰撞组件要在所有之后，因为要计算最终位置的碰撞
 */
declare namespace EXECUTION_ORDER {
	let Gravity: number
	let Collision: number
}