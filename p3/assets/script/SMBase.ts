// SMBase.ts
// 状态机：
//
// lly 2018.1.5

const StateBeginuNmber: number = 1173000;

export class SMMgr<SMObj> {
    /** 生成状态机的状态，避免重复 */
    static _newestStateNumber: number = StateBeginuNmber;
    static createSMState() {
        ++SMMgr._newestStateNumber;
        return SMMgr._newestStateNumber;
    }

    /** 检测状态数字是否正确 */
    static checkSMState(st: number) {
        let n = st - StateBeginuNmber;
        cc.assert(0 < n && n < StateBeginuNmber, 'wrong sm st');
    }

    /** 状态列表，enum: SMForHero */
    stateList: { [key: number]: SM<SMObj> } = {};
    /** 当前状态 */
    curState: number = null;
    /** 当前状态机 */
    curStateMachine: SM<SMObj> = null;
    /** 英雄：通过hero类对外界进行影响和控制 */
    smObj: SMObj = null;

    /**
     * 初始化状态机
     * @param hero: 对外界控制的关键
     * @param st: 起始状态
     */
    constructor(smObj: SMObj) {
        this.smObj = smObj;
    }

    // 最开始的状态
    begin(st: number) {
        SMMgr.checkSMState(st);
        this._setState(st);
        this.curStateMachine.begin(this);
        return this;
    }

    /**
     * 变化到某个状态
     * @param st: 状态
     */
    changeStateTo(st: number) {
        SMMgr.checkSMState(st);

        let stMachine = this.stateList[st];

        if (!stMachine.can(this)) return;

        this.curStateMachine.end(this);

        this._setState(st);

        this.curStateMachine.begin(this);
    }

    /**
     * 通过总状态机调用当前状态机的update；update中完成当前状态对外界的影响
     */
    machineUpdate(dt: number) {
        this.curStateMachine.update(dt, this);
    }

    /**
     * 通过总状态机调用当前状态机的check；check主要用于检测是否需要变化
     */
    machineCheck() {
        this.curStateMachine.check(this);
    }

    /** 设置当前状态和状态机 */
    _setState(st: number) {
        this.curState = st;
        this.curStateMachine = this.stateList[st];
    }
}

export class SM<SMObj> {
    can(mgr: SMMgr<SMObj>): boolean {
        return true;
    }

    begin(mgr: SMMgr<SMObj>) {}
    update(dt: number, mgr: SMMgr<SMObj>) {}
    check(mgr: SMMgr<SMObj>) {}
    end(mgr: SMMgr<SMObj>) {}
}
