// ConstValue.ts
// 常量
// lly 2017.10.22

export enum MyEvent {
    direction,
    volecity,
}

export function MyName(myEvent: MyEvent): string {
    return 'MyEvent' + myEvent.toString()
}

export enum Direction {
    D0, D22p5, D45, D67p5,
	D90, D112p5, D135, D157p5,
	D180, D202p5, D225, D247p5,
	D270, D292p5, D315, D337p5,
	Dnone,
}
