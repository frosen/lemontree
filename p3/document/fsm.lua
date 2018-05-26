[stand]
	CAN:

	BEGIN:
		[ui stand], [attri 跳跃次数补满], [x轴速度0]

	UPDATE: 

	CHECK: 
		[敌人碰撞]->hurt, [collison y碰撞 false]->jump, [根据xDir]->move

	END:

	jumpAcce: true
	dash: true

[jumpAcce]
	CAN:
		[之前状态不是 dash和hurt], [attri 剩余跳跃次数>0]

	BEGIN:
		[ui jumpUp], [self 计时], [attri 剩余跳跃次数-1]

	UPDATE: 
		[movableObj y轴速度], [根据xDir, movableObj x轴速度, ui dir] as move

	CHECK: 
		[敌人碰撞]->hurt, [self 到时间]->jump, [collison y碰撞 true]->jump

	END:
		[self 停止计时]

	jumpAcce: false
	dash: true

[jump]
	CAN:

	BEGIN:
		[ui jumpUp]or[ui jumpDown]

	UPDATE: 
		[根据xDir, movableObj x轴速度, ui dir] as move, [movableObj y轴速度]->[ui jumpUp]or[ui jumpDown], 

	CHECK: 
		[敌人碰撞]->hurt, [collison y下方碰撞 true]->根据xDir->stand or move

	END:

	jumpAcce: true
	dash: true

[move]
	CAN:
	
	BEGIN:
		[ui move]

	UPDATE: 
		[根据xDir, movableObj x轴速度, ui dir]

	CHECK: 
		[敌人碰撞]->hurt, [collison y碰撞 false]->jump, [根据xDir == 0]->stand

	END:

	jumpAcce: true
	dash: true

[dash]
	CAN:
		[之前状态不是 dash和hurt], [attri 剩余dash次数>0], [禁止y轴运动]
	
	BEGIN:
		[ui dash], [self 计时], [确定方向], [进入不可攻击状态], [attri 剩余dash次数-1]

	UPDATE: 
		[根据确定方向, movableObj x轴速度, ui dir]

	CHECK: 
		[敌人碰撞]->hurt, [self 到时间]->根据y碰撞 false->jump or 根据xDir~=0->move or stand

	END:
		[self 停止计时], [结束不可攻击状态], [开启y轴运动]


[hurt]
	CAN:
	
	BEGIN:
		[ui hurt], [根据受伤方向, ui dir], [y轴速度], [进入不可攻击状态]

	UPDATE: 
		[根据 ui dir, x轴速度反方向]

	CHECK: 
		[collison y碰撞下方碰撞 true]->根据xDir~=0->move or stand

	END:
		[hero 进入短暂无敌时间], [结束不可攻击状态]


--------------------------------------------------------------------------------------

1. can
2. last end
3. replace
4. new begin

--------------------------------------------------------------------------------------

[下跳]













