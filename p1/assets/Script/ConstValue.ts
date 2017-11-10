// ConstValue.ts
// 常量
// lly 2017.10.22

export enum MyEvent {
    direction,
    volecity,

    colide,
    hurt,
    hurtEnd,
    dead,
}

export function MyName(myEvent: MyEvent): string {
    return 'MyEvent' + myEvent.toString()
}

export enum Direction {
    D0, D45, 
	D90, D135, 
	D180, D225, 
	D270, D315, 
	Dnone,
}

const dirVector = [
    {x: 0, y: 1}, 
    {x: 0.7071, y: 0.7071}, 
    {x: 1, y: 0}, 
    {x: 0.7071, y: -0.7071}, 
    {x: 0, y: -1},  
    {x: -0.7071, y: -0.7071},
    {x: -1, y: 0},
    {x: -0.7071, y: 0.7071},
    {x: 0, y: 0}, 
]

export function getDirVector(dir: Direction): {x: number, y: number} {
    return dirVector[dir.valueOf()];
}

export enum Velocity {
    stop,
    slow,
    mid,
    fast,
}
