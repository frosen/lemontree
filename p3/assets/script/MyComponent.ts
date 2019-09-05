// MyComponent.ts
// 自定义的组件，可以被GameCtrlr暂停：
// lly 2018.8.12

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyComponent extends cc.Component {
    enableSaveForPause: boolean = false;
}
