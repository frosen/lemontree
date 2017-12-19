// 自定义 -------------------

/**
 * 定义了脚本执行顺序
 */
declare namespace EXECUTION_ORDER {
	/** 其他组件 -> 重力组件 -> 碰撞组件 */
	let Gravity: number

	/** 其他组件 -> 重力组件 -> 碰撞组件 */
	let Collision: number
}