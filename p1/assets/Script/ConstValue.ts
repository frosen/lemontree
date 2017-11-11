// ConstValue.ts
// 常量
// lly 2017.10.22

export enum MyEvent {
    move,
    endMove,

    colide,
    hurt,
    hurtEnd,
    dead,
}

export function MyName(myEvent: MyEvent): string {
    return 'MyEvent' + myEvent.toString()
}
