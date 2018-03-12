require = function t(e, o, n) {
function i(c, s) {
if (!o[c]) {
if (!e[c]) {
var a = "function" == typeof require && require;
if (!s && a) return a(c, !0);
if (r) return r(c, !0);
var u = new Error("Cannot find module '" + c + "'");
throw u.code = "MODULE_NOT_FOUND", u;
}
var l = o[c] = {
exports: {}
};
e[c][0].call(l.exports, function(t) {
var o = e[c][1][t];
return i(o || t);
}, l, l.exports, t, e, o, n);
}
return o[c].exports;
}
for (var r = "function" == typeof require && require, c = 0; c < n.length; c++) i(n[c]);
return i;
}({
Attack: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "deb69X28QpAZK/g3dYhcxbs", "Attack");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.onLoad = function() {};
return e = __decorate([ i ], e);
}(cc.Component));
o.default = r;
cc._RF.pop();
}, {} ],
AttriForHero: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "234f3hSsxJPZrIsilz/id3k", "AttriForHero");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = 4.5, i = function() {
function t() {
this.hp = 0;
this.xSpeed = 0;
this.ySpeed = n;
this.jumpCount = 1;
this.maxJumpCount = 2;
this.dashCount = 1;
this.maxDashCount = 1;
this.invcTimeForHurt = .5;
this.hp = 100;
this.xSpeed = 3;
}
t.prototype.fillJumpAndDashCount = function() {
this.jumpCount = this.maxJumpCount;
this.dashCount = this.maxDashCount;
};
return t;
}();
o.default = i;
cc._RF.pop();
}, {} ],
BTBase: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "ab271v6cGNN3Z0fjXk7+/y7", "BTBase");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, n.executionOrder), c = t("./BTNode"), s = function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.start = function() {
for (var t = 0, e = this.node.children; t < e.length; t++) {
e[t].active = !1;
}
};
e.prototype.update = function(t) {
for (var e = 0, o = this.node.children; e < o.length; e++) {
var n = o[e].getComponent(c.BTNode);
n.excute() == c.BTResult.running && n.doAction();
}
};
return e = __decorate([ i, r(EXECUTION_ORDER.BehaviorTree) ], e);
}(cc.Component);
o.default = s;
cc._RF.pop();
}, {
"./BTNode": "BTNode"
} ],
BTNodeActSet: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "f7318fi4zFDU7Pwi3VadLd+", "BTNodeActSet");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./BTNode"), s = t("./BTBase"), a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "SET";
e.excuteNode = null;
e.excuteAttriString = "";
e.excuteComp = null;
e.attriString = "";
return e;
}
e.prototype.onLoad = function() {
if (!this.excuteNode) {
for (var t = this.node.parent; !t.getComponent(s.default); ) t = t.parent;
this.excuteNode = t.parent;
}
var e = this.excuteAttriString.split(":");
this.excuteComp = this.excuteNode.getComponent(e[0]);
myAssert(this.excuteComp, "When get attri: " + this.excuteNode.name + " wrong component: " + e[0]);
this.attriString = e[1];
myAssert(this.excuteComp[this.attriString], this.excuteNode.name + " component: " + e[0] + " not have: " + e[1]);
};
e.prototype.excute = function() {
this.doSet();
return c.BTResult.continue;
};
e.prototype.doSet = function() {
this.excuteComp[this.attriString]();
};
e.prototype.getBTName = function() {
return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteAttriString;
};
__decorate([ r(cc.Node) ], e.prototype, "excuteNode", void 0);
__decorate([ r ], e.prototype, "excuteAttriString", void 0);
return e = __decorate([ i ], e);
}(c.BTNode);
o.default = a;
cc._RF.pop();
}, {
"./BTBase": "BTBase",
"./BTNode": "BTNode"
} ],
BTNodeActionEnd: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "64a3dNy45lOqJkk+9yJkFLF", "BTNodeActionEnd");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./BTNode")), c = t("./BTNodeAction"), s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "End Excuting";
return e;
}
e.prototype.onLoad = function() {
myAssert(this.node.parent.getComponent(c.default), "BTNodeActionEnd need action parent");
};
e.prototype.getBTName = function() {
return "";
};
return e = __decorate([ i ], e);
}(r.BTNode);
o.default = s;
cc._RF.pop();
}, {
"./BTNode": "BTNode",
"./BTNodeAction": "BTNodeAction"
} ],
BTNodeActionUntil: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "0ee32oyptxIbbeLwQWQyuIV", "BTNodeActionUntil");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./BTNode")), c = t("./BTNodeAction"), s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "Until";
return e;
}
e.prototype.onLoad = function() {
myAssert(this.node.parent.getComponent(c.default), "BTNodeActionEnd need action parent");
};
e.prototype.getBTName = function() {
return "";
};
return e = __decorate([ i ], e);
}(r.BTNode);
o.default = s;
cc._RF.pop();
}, {
"./BTNode": "BTNode",
"./BTNodeAction": "BTNodeAction"
} ],
BTNodeAction: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "137c8vi239Fso50YwIq0Jvy", "BTNodeAction");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./BTNode"), s = t("./BTNodeActionUntil"), a = t("./BTNodeActionEnd"), u = t("./BTBase"), l = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "DO";
e.excuteNode = null;
e.excuteFuncString = "";
e.excuteFunc = null;
e.untilFuncs = [];
e.endFuncs = [];
e.running = !1;
e.goingToAction = !1;
return e;
}
e.prototype.onLoad = function() {
if (!this.excuteNode) {
for (var t = this.node.parent; !t.getComponent(u.default); ) t = t.parent;
this.excuteNode = t.parent;
}
this.excuteFunc = getFuncFromString(this.excuteNode, this.excuteFuncString);
};
e.prototype.start = function() {
for (var t = 0, e = this.node.children; t < e.length; t++) {
var o = e[t];
if (o.getComponent(s.default)) for (var n = 0, i = o.children; n < i.length; n++) {
var r = (h = i[n].getComponent(c.BTNode)).excute.bind(h);
this.untilFuncs.push(r);
} else if (o.getComponent(a.default)) for (var u = 0, l = o.children; u < l.length; u++) {
var h;
r = (h = l[u].getComponent(c.BTNode)).excute.bind(h);
this.endFuncs.push(r);
} else cc.error("wrong child in action");
}
};
e.prototype.excute = function() {
if (this.running) {
if (this.checkRunningEnd()) {
this.endRunning();
return c.BTResult.continue;
}
return c.BTResult.running;
}
this.running = !0;
this.goingToAction = !0;
return c.BTResult.running;
};
e.prototype.doAction = function() {
if (this.goingToAction) {
this.goingToAction = !1;
this.excuteFunc();
}
};
e.prototype.getBTName = function() {
return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteFuncString;
};
e.prototype.isRunning = function() {
return this.running;
};
e.prototype.endRunning = function() {
this.running = !1;
for (var t = 0, e = this.endFuncs; t < e.length; t++) {
(0, e[t])();
}
};
e.prototype.checkRunningEnd = function() {
for (var t = 0, e = this.untilFuncs; t < e.length; t++) {
if ((0, e[t])() == c.BTResult.suc) return !0;
}
return !1;
};
__decorate([ r(cc.Node) ], e.prototype, "excuteNode", void 0);
__decorate([ r ], e.prototype, "excuteFuncString", void 0);
return e = __decorate([ i ], e);
}(c.BTNode);
o.default = l;
cc._RF.pop();
}, {
"./BTBase": "BTBase",
"./BTNode": "BTNode",
"./BTNodeActionEnd": "BTNodeActionEnd",
"./BTNodeActionUntil": "BTNodeActionUntil"
} ],
BTNodeCdtionBool: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "ced9cubinNIrJBRO3ZHKvPe", "BTNodeCdtionBool");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.excuteFunc = null;
e.checkingTrue = !0;
return e;
}
e.prototype.createExcuteFunc = function(t, e) {
this.excuteFunc = getFuncFromString(t, e);
};
e.prototype.doExcuteFunc = function() {
return this.excuteFunc() == this.checkingTrue;
};
e.prototype.getExcuteResStr = function() {
return this.checkingTrue ? "True" : "False";
};
__decorate([ r ], e.prototype, "checkingTrue", void 0);
return e = __decorate([ i ], e);
}(t("./BTNodeCdtion").default);
o.default = c;
cc._RF.pop();
}, {
"./BTNodeCdtion": "BTNodeCdtion"
} ],
BTNodeCdtionNum: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "43ebeq7dwZN8Yuvt/KjALLQ", "BTNodeCdtionNum");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./BTNodeCdtion"), s = cc.Enum({
equal: 0,
notEqual: 1,
moreThan: 2,
lessThan: 3,
notMoreThan: 4,
notLessThan: 5
}), a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.excuteFunc = null;
e.compareType = s.equal;
e.compareNum = 0;
return e;
}
e.prototype.createExcuteFunc = function(t, e) {
this.excuteFunc = getFuncFromString(t, e);
};
e.prototype.doExcuteFunc = function() {
var t = this.excuteFunc();
switch (this.compareType) {
case s.equal:
return t == this.compareNum;

case s.notEqual:
return t != this.compareNum;

case s.moreThan:
return t > this.compareNum;

case s.lessThan:
return t < this.compareNum;

case s.notMoreThan:
return t <= this.compareNum;

case s.notLessThan:
return t >= this.compareNum;
}
};
e.prototype.getExcuteResStr = function() {
var t = "";
switch (this.compareType) {
case s.equal:
t += "== ";
break;

case s.notEqual:
t += "!= ";
break;

case s.moreThan:
t += "> ";
break;

case s.lessThan:
t += "< ";
break;

case s.notMoreThan:
t += "<= ";
break;

case s.notLessThan:
t += ">= ";
}
return t + this.compareNum.toString();
};
__decorate([ r({
type: s
}) ], e.prototype, "compareType", void 0);
__decorate([ r ], e.prototype, "compareNum", void 0);
return e = __decorate([ i ], e);
}(c.default);
o.default = a;
cc._RF.pop();
}, {
"./BTNodeCdtion": "BTNodeCdtion"
} ],
BTNodeCdtion: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "5079dsqnhtOk70+eronemvt", "BTNodeCdtion");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./BTNode"), s = t("./BTBase"), a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "IF";
e.excuteNode = null;
e.excuteFuncString = "";
return e;
}
e.prototype.onLoad = function() {
if (!this.excuteNode) {
for (var t = this.node.parent; !t.getComponent(s.default); ) t = t.parent;
this.excuteNode = t.parent;
}
this.createExcuteFunc(this.excuteNode, this.excuteFuncString);
};
e.prototype.excute = function() {
return this.doExcuteFunc() ? c.BTResult.suc : c.BTResult.fail;
};
e.prototype.getBTName = function() {
return (this.excuteNode ? this.excuteNode.name : "BT Root") + " >> " + this.excuteFuncString + " is " + this.getExcuteResStr();
};
e.prototype.createExcuteFunc = function(t, e) {
cc.error("need inherit");
};
e.prototype.doExcuteFunc = function() {
cc.error("need inherit");
return !1;
};
e.prototype.getExcuteResStr = function() {
return "";
};
__decorate([ r(cc.Node) ], e.prototype, "excuteNode", void 0);
__decorate([ r ], e.prototype, "excuteFuncString", void 0);
return e = __decorate([ i ], e);
}(c.BTNode);
o.default = a;
cc._RF.pop();
}, {
"./BTBase": "BTBase",
"./BTNode": "BTNode"
} ],
BTNodeGroup: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "6b2032gNzhC8ZYyvlk6Zvb/", "BTNodeGroup");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./BTNode"), s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "Composite";
e.btNodes = [];
e.desc = "";
return e;
}
e.prototype.start = function() {
for (var t = 0, e = this.node.children; t < e.length; t++) {
var o = e[t].getComponent(c.BTNode);
this.btNodes.push(o);
}
};
e.prototype.excute = function() {
cc.error("need inhert");
return c.BTResult.suc;
};
e.prototype.getBTName = function() {
return this.desc;
};
__decorate([ r ], e.prototype, "desc", void 0);
return e = __decorate([ i ], e);
}(c.BTNode);
o.default = s;
cc._RF.pop();
}, {
"./BTNode": "BTNode"
} ],
BTNodeParallel: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "bad8eXfmW1AqqXhb0lufoBv", "BTNodeParallel");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./BTNode")), c = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "Parallel";
return e;
}
e.prototype.excute = function() {
for (var t = 0, e = this.btNodes; t < e.length; t++) {
var o = e[t];
o.excute() == r.BTResult.running && o.doAction();
}
return r.BTResult.suc;
};
return e = __decorate([ i ], e);
}(t("./BTNodeGroup").default);
o.default = c;
cc._RF.pop();
}, {
"./BTNode": "BTNode",
"./BTNodeGroup": "BTNodeGroup"
} ],
BTNodeSelect: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "f0be4ygcmxIA5RrmBV4fHU2", "BTNodeSelect");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./BTNode")), c = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "Select";
e.checkingAheadInRunning = !0;
return e;
}
e.prototype.excuteInNormal = function(t) {
void 0 === t && (t = 0);
for (var e = t; e < this.btNodes.length; e++) {
var o = this.btNodes[e], n = o.excute();
if (n == r.BTResult.suc) return r.BTResult.suc;
if (n == r.BTResult.running) {
this.curRunningBTNode = o;
return r.BTResult.running;
}
}
return r.BTResult.fail;
};
e.prototype.excuteInRunning = function() {
if (this.checkingAheadInRunning) for (var t = 0, e = this.btNodes; t < e.length; t++) {
var o = e[t];
if (o == this.curRunningBTNode) break;
var n = o.excute();
if (n == r.BTResult.suc) {
this.endRunning();
return r.BTResult.suc;
}
if (n == r.BTResult.running) {
this.endRunning();
this.curRunningBTNode = o;
return r.BTResult.running;
}
}
if (this.curRunningBTNode.excute() != r.BTResult.running) {
var i = this.btNodes.indexOf(this.curRunningBTNode) + 1;
this.curRunningBTNode = null;
return this.excuteInNormal(i);
}
return r.BTResult.running;
};
e.prototype.getCheckingAheadInRunningStr = function() {
return this.checkingAheadInRunning ? "" : " --- NCA";
};
return e = __decorate([ i ], e);
}(t("./BTNodeSequence").default);
o.default = c;
cc._RF.pop();
}, {
"./BTNode": "BTNode",
"./BTNodeSequence": "BTNodeSequence"
} ],
BTNodeSequence: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "bb04fd0MwVDvale+mlaqRf/", "BTNodeSequence");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./BTNode"), s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "Sequence";
e.checkingAheadInRunning = !1;
e.curRunningBTNode = null;
return e;
}
e.prototype.excute = function() {
return this.isRunning() ? this.excuteInRunning() : this.excuteInNormal();
};
e.prototype.excuteInNormal = function(t) {
void 0 === t && (t = 0);
for (var e = t; e < this.btNodes.length; e++) {
var o = this.btNodes[e], n = o.excute();
if (n == c.BTResult.fail) return c.BTResult.fail;
if (n == c.BTResult.running) {
this.curRunningBTNode = o;
return c.BTResult.running;
}
}
return c.BTResult.suc;
};
e.prototype.excuteInRunning = function() {
if (this.checkingAheadInRunning) for (var t = 0, e = this.btNodes; t < e.length; t++) {
var o = e[t];
if (o == this.curRunningBTNode) break;
var n = o.excute();
if (n == c.BTResult.fail) {
this.endRunning();
return c.BTResult.fail;
}
if (n == c.BTResult.running) {
this.endRunning();
this.curRunningBTNode = o;
return c.BTResult.running;
}
}
if (this.curRunningBTNode.excute() != c.BTResult.running) {
var i = this.btNodes.indexOf(this.curRunningBTNode) + 1;
this.curRunningBTNode = null;
return this.excuteInNormal(i);
}
return c.BTResult.running;
};
e.prototype.doAction = function() {
this.curRunningBTNode.doAction();
};
e.prototype.isRunning = function() {
return null != this.curRunningBTNode;
};
e.prototype.endRunning = function() {
this.curRunningBTNode.endRunning();
this.curRunningBTNode = null;
};
e.prototype.getBTName = function() {
return t.prototype.getBTName.call(this) + this.getCheckingAheadInRunningStr();
};
e.prototype.getCheckingAheadInRunningStr = function() {
return this.checkingAheadInRunning ? " --- CA" : "";
};
__decorate([ r ], e.prototype, "checkingAheadInRunning", void 0);
return e = __decorate([ i ], e);
}(t("./BTNodeGroup").default);
o.default = s;
cc._RF.pop();
}, {
"./BTNode": "BTNode",
"./BTNodeGroup": "BTNodeGroup"
} ],
BTNode: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "11bc9MNgTpLqYTIu+DCq6uj", "BTNode");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n, i = cc._decorator, r = i.ccclass, c = (i.property, i.executeInEditMode), s = i.disallowMultiple;
(function(t) {
t[t.suc = 0] = "suc";
t[t.fail = 1] = "fail";
t[t.running = 2] = "running";
t[t.continue = 3] = "continue";
})(n = o.BTResult || (o.BTResult = {}));
var a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.typeString = "";
return e;
}
e.prototype.excute = function() {
cc.error("need inhert");
return n.suc;
};
e.prototype.doAction = function() {};
e.prototype.update = function() {
this.node.name = this.typeString + ": " + this.getBTName();
};
e.prototype.getBTName = function() {
cc.error("need inhert");
return "";
};
e.prototype.isRunning = function() {
return !1;
};
e.prototype.endRunning = function() {};
return e = __decorate([ r, c, s ], e);
}(cc.Component);
o.BTNode = a;
cc._RF.pop();
}, {} ],
CameraCtrlr: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "7418fGdkatL6q+Qym2mbIGR", "CameraCtrlr");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = n.executionOrder, s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.camera = null;
e.target = null;
e.map = null;
e.xMin = null;
e.xMax = null;
e.yMin = null;
e.yMax = null;
return e;
}
e.prototype.onLoad = function() {
var t = cc.find("canvas").getContentSize(), e = this.map.getContentSize();
this.xMin = .5 * t.width;
this.xMax = e.width - .5 * t.width;
this.yMin = .5 * t.height;
this.yMax = e.height - .5 * t.height;
};
e.prototype.update = function() {
var t = this.target.parent.convertToWorldSpaceAR(this.target.position), e = this.node.parent.convertToNodeSpaceAR(t);
e.x = Math.min(Math.max(e.x, this.xMin), this.xMax);
e.y = Math.min(Math.max(e.y, this.yMin), this.yMax);
this.node.position = e;
};
__decorate([ r(cc.Camera) ], e.prototype, "camera", void 0);
__decorate([ r(cc.Node) ], e.prototype, "target", void 0);
__decorate([ r(cc.Node) ], e.prototype, "map", void 0);
return e = __decorate([ i, c(EXECUTION_ORDER.CameraCtrlr) ], e);
}(cc.Component);
o.default = s;
cc._RF.pop();
}, {} ],
CanvasCtrlr: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "3e714BCFwhHjr2bPQOQ+3nn", "CanvasCtrlr");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.onLoad = function() {
var t = this.getComponent(cc.Canvas), e = cc.view.getFrameSize();
if (e.width / e.height > 1.778) {
t.fitHeight = !0;
t.fitWidth = !1;
} else {
t.fitHeight = !1;
t.fitWidth = !0;
}
cc.view.enableAntiAlias(!1);
};
return e = __decorate([ i ], e);
}(cc.Component));
o.default = r;
cc._RF.pop();
}, {} ],
CtrlIndicator: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "952bbGn0ORL2IV0PL1fP+uv", "CtrlIndicator");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./HeroCtrlr"), s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.ctrlr = null;
e.sp = null;
return e;
}
e.prototype.onLoad = function() {
requireComponents(this, [ cc.Sprite ]);
this.sp = this.node.getComponent(cc.Sprite);
};
e.prototype.update = function() {
var t = this.ctrlr.moveBeginPos;
if (t) {
this.sp.enabled = !0;
this.node.position = t;
} else this.sp.enabled = !1;
};
__decorate([ r(c.default) ], e.prototype, "ctrlr", void 0);
return e = __decorate([ i ], e);
}(cc.Component);
o.default = s;
cc._RF.pop();
}, {
"./HeroCtrlr": "HeroCtrlr"
} ],
Enemy: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "8f1f8sP5BdKZoOdIU+XIxZe", "Enemy");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./Attack")), c = t("./ObjCollider"), s = t("./ObjColliderForWatch"), a = t("./MovableObject"), u = t("./TerrainCollider"), l = t("./TerrainCtrlr"), h = t("./Hero"), p = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.objCollider = null;
e.watchCollider = null;
e.aim = null;
e.aimDir = 0;
return e;
}
e.prototype.onLoad = function() {
requireComponents(this, [ r.default, c.ObjCollider, s.default ]);
this.objCollider = this.getComponent(c.ObjCollider);
this.watchCollider = this.getComponent(s.default);
this.objCollider.callback = this.onCollision.bind(this);
this.watchCollider.callback = this.onWatching.bind(this);
};
e.prototype.onCollision = function(t) {};
e.prototype.onWatching = function(t) {
this.aim = null;
for (var e = 0, o = t; e < o.length; e++) {
var n = o[e].cldr;
if (n.constructor != s.default) {
var i = n.getComponent(h.default);
if (i) if (this.aim) {
Math.abs(i.node.x - this.node.x) < Math.abs(this.aim.node.x - this.node.x) && (this.aim = i);
} else this.aim = i;
}
}
this.aimDir = this.aim ? this.aim.node.x - this.node.x > 0 ? 1 : -1 : 0;
};
e.prototype.moveForward = function() {
this.getComponent(a.MovableObject).xVelocity = 1 * this.node.scaleX;
};
e.prototype.stopMoving = function() {
this.getComponent(a.MovableObject).xVelocity = 0;
};
e.prototype.turnAround = function() {
this.node.scaleX *= -1;
};
e.prototype.isEdgeForward = function() {
var t = this.getComponent(u.default).edgeType;
return t == l.CollisionType.none || t == l.CollisionType.entity;
};
e.prototype.getAimDir = function() {
return this.aim ? this.aimDir == this.node.scaleX ? 1 : -1 : 0;
};
e.prototype.moveToAim = function() {
this.node.scaleX = Math.abs(this.node.scaleX) * this.aimDir;
this.getComponent(a.MovableObject).xVelocity = 3 * this.node.scaleX;
};
return e = __decorate([ i ], e);
}(cc.Component);
o.default = p;
cc._RF.pop();
}, {
"./Attack": "Attack",
"./Hero": "Hero",
"./MovableObject": "MovableObject",
"./ObjCollider": "ObjCollider",
"./ObjColliderForWatch": "ObjColliderForWatch",
"./TerrainCollider": "TerrainCollider",
"./TerrainCtrlr": "TerrainCtrlr"
} ],
Global: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "c9b89RAe79Nm7tNRkwGYsKq", "Global");
window.EXECUTION_ORDER = {
MovableObject: 1,
TerrainCollider: 2,
ObjCollider: 3,
BehaviorTree: 4,
CameraCtrlr: 5
};
window.getFuncFromString = function(t, e) {
var o = e.split(":"), n = t.getComponent(o[0]);
cc.assert(n, "When get func: " + t.name + " wrong component: " + o[0]);
var i = n[o[1]];
cc.assert(i && "function" == typeof i, o[0] + " wrong component function: " + o[1]);
return i.bind(n);
};
window.requireComponents = function(t, e) {
for (var o = !0, n = "", i = 0; i < e.length; i++) {
var r = e[i], c = !!t.getComponent(r);
o = o && c;
c || (n += r.name + ",");
}
cc.assert(o, "[" + t.name + "] need component: " + n);
};
window.myAssert = cc.assert;
window.curLineInfo = function() {
try {
throw new Error();
} catch (t) {
return t.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
}
};
cc._RF.pop();
}, {} ],
Gravity: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "dff690rpulIrIGiVCCOJXcp", "Gravity");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./MovableObject")), c = function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.onLoad = function() {
requireComponents(this, [ r.MovableObject ]);
this.getComponent(r.MovableObject).yAccel = -.25;
};
return e = __decorate([ i ], e);
}(cc.Component);
o.default = c;
cc._RF.pop();
}, {
"./MovableObject": "MovableObject"
} ],
HeroCtrlr: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "6a4abrGlIRGcZDieeSSNM08", "HeroCtrlr");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = t("./Hero"), s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.hero = null;
e.moveWRate = .4;
e.moveHRate = .67;
e.jumpXRate = .6;
e.jumpHRate = .5;
e.moveW = 0;
e.moveH = 0;
e.jumpX = 0;
e.jumpH = 0;
e.moveTouchId = null;
e.moveBeginPos = null;
e.watchTouchId = null;
e.watchBeginPos = null;
e.jumpTouchId = null;
return e;
}
e.prototype.onLoad = function() {
var t = this.node.getContentSize();
this.moveW = t.width * this.moveWRate;
this.moveH = t.height * this.moveHRate;
this.jumpX = t.width * this.jumpXRate;
this.jumpH = t.height * this.jumpHRate;
this.initTouchEvents();
this.initKeyboardEvents();
};
e.prototype.initTouchEvents = function() {
this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
};
e.prototype.onTouchStart = function(t) {
var e = t.getLocation();
if (e.x <= this.moveW) if (e.y < this.moveH) {
this.moveTouchId = t.getID();
this.moveBeginPos = cc.v2(Math.max(e.x, 30), Math.max(e.y, 30));
} else {
this.watchTouchId = t.getID();
this.watchBeginPos = e;
} else if (this.jumpX <= e.x) if (e.y < this.jumpH) {
this.jumpTouchId = t.getID();
this.hero.jump(!0);
} else this.hero.dash();
};
e.prototype.onTouchMove = function(t) {
if (t.getID() == this.moveTouchId) {
var e = t.getLocation().x - this.moveBeginPos.x, o = e > 0 ? 1 : -1;
Math.abs(e) > 20 ? this.hero.move(o) : this.hero.move(0);
} else t.getID() == this.watchTouchId && cc.log("watch!");
};
e.prototype.onTouchEnd = function(t) {
var e = t.getID();
if (e == this.moveTouchId) {
this.moveTouchId = null;
this.moveBeginPos = null;
this.hero.move(0);
} else if (e == this.watchTouchId) {
this.watchTouchId = null;
cc.log("watch! end");
} else if (e == this.jumpTouchId) {
this.jumpTouchId = null;
this.hero.jump(!1);
}
};
e.prototype.initKeyboardEvents = function() {
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
};
e.prototype.onKeyDown = function(t) {
switch (t.keyCode) {
case cc.KEY.a:
case cc.KEY.left:
this.hero.move(-1);
break;

case cc.KEY.d:
case cc.KEY.right:
this.hero.move(1);
break;

case cc.KEY.up:
case cc.KEY.w:
this.hero.jump(!0);
break;

case cc.KEY.down:
case cc.KEY.s:
this.hero.use();
break;

case cc.KEY.space:
this.hero.dash();
}
};
e.prototype.onKeyUp = function(t) {
switch (t.keyCode) {
case cc.KEY.a:
case cc.KEY.left:
this.hero.xMoveDir < 0 && this.hero.move(0);
break;

case cc.KEY.d:
case cc.KEY.right:
this.hero.xMoveDir > 0 && this.hero.move(0);
break;

case cc.KEY.up:
case cc.KEY.w:
this.hero.jump(!1);
}
};
__decorate([ r(c.default) ], e.prototype, "hero", void 0);
return e = __decorate([ i ], e);
}(cc.Component);
o.default = s;
cc._RF.pop();
}, {
"./Hero": "Hero"
} ],
HeroUI: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "0f8b1tDICNC647G2kLhoe2S", "HeroUI");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n, i = cc._decorator, r = i.ccclass, c = i.property;
(function(t) {
t[t.move = 0] = "move";
t[t.attack = 1] = "attack";
t[t.hurt = 2] = "hurt";
})(n = o.UIDirLvType || (o.UIDirLvType = {}));
var s = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.body = null;
e.xUIDirs = {};
return e;
}
e.prototype.onLoad = function() {
this.xUIDirs[n.move] = 1;
this.xUIDirs[n.attack] = 0;
this.xUIDirs[n.hurt] = 0;
this.node.setCascadeOpacityEnabled(!0);
};
e.prototype.setXUIDir = function(t, e) {
if (0 != t || e != n.move) {
this.xUIDirs[e] = t;
if (0 != t) {
var o = this.xUIDir;
this.node.scaleX = Math.abs(this.node.scaleX) * o;
}
}
};
Object.defineProperty(e.prototype, "xUIDir", {
get: function() {
var t = this.xUIDirs[n.hurt];
if (0 != t) return t;
var e = this.xUIDirs[n.attack];
return 0 != e ? e : this.xUIDirs[n.move];
},
enumerable: !0,
configurable: !0
});
e.prototype.stand = function() {
this.body.node.skewX = 0;
this.body.node.skewY = 0;
};
e.prototype.endStand = function() {};
e.prototype.jumpUp = function() {
this.body.node.skewX = 0;
this.body.node.skewY = 5;
};
e.prototype.endJumpUp = function() {};
e.prototype.jumpDown = function() {
this.body.node.skewX = 0;
this.body.node.skewY = -5;
};
e.prototype.endJumpDown = function() {};
e.prototype.move = function() {
this.body.node.skewX = 5;
this.body.node.skewY = 0;
};
e.prototype.endMove = function() {};
e.prototype.dash = function() {
this.body.node.skewX = 15;
this.body.node.skewY = 0;
};
e.prototype.endDash = function() {};
e.prototype.hurt = function() {
this.body.node.skewX = 0;
this.body.node.skewY = 0;
this.setInvincibleEnabled(!0);
};
e.prototype.endHurt = function() {
this.setInvincibleEnabled(!1);
};
e.prototype.setInvincibleEnabled = function(t) {
this.node.opacity = t ? 100 : 255;
};
__decorate([ c(cc.Sprite) ], e.prototype, "body", void 0);
return e = __decorate([ r ], e);
}(cc.Component);
o.HeroUI = s;
cc._RF.pop();
}, {} ],
Hero: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "ee93ch9wsVBQ6y+IQDLJOdh", "Hero");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, t("./MovableObject")), c = t("./TerrainCollider"), s = t("./ObjCollider"), a = t("./ObjColliderForWatch"), u = t("./HeroUI"), l = t("./AttriForHero"), h = t("./SMForHero"), p = t("./Attack"), d = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.movableObj = null;
e.terrainCollider = null;
e.objCollider = null;
e.watchCollider = null;
e.ui = null;
e.attri = null;
e.sm = null;
e.smInvc = null;
e.xMoveDir = 0;
e.hurtCollisionData = null;
return e;
}
e.prototype.onLoad = function() {
requireComponents(this, [ r.MovableObject, c.default, s.ObjCollider, a.default, u.HeroUI ]);
this.movableObj = this.getComponent(r.MovableObject);
this.terrainCollider = this.getComponent(c.default);
this.objCollider = this.getComponent(s.ObjCollider);
this.watchCollider = this.getComponent(a.default);
this.ui = this.getComponent(u.HeroUI);
this.attri = new l.default();
this.sm = new h.SMForHeroMgr(this, h.ActState.stand);
this.smInvc = new h.SMForHeroInvcMgr(this);
this.objCollider.callback = this.onCollision.bind(this);
this.watchCollider.callback = this.onWatching.bind(this);
};
e.prototype.update = function(t) {
this.sm.machineUpdate(t);
this.smInvc.machineUpdate(t);
};
e.prototype.lateUpdate = function() {
this.sm.machineCheck();
};
e.prototype.move = function(t) {
this.xMoveDir = t;
};
e.prototype.dash = function() {
this.sm.changeStateTo(h.ActState.dash);
};
e.prototype.jump = function(t) {
t ? this.sm.changeStateTo(h.ActState.jumpAccelerating) : this.sm.curState == h.ActState.jumpAccelerating && this.sm.changeStateTo(h.ActState.jump);
};
e.prototype.use = function() {
this.node.y -= 2;
};
e.prototype.onCollision = function(t) {
this.hurtCollisionData = null;
for (var e = 0, o = t; e < o.length; e++) {
var n = o[e];
if (n.cldr.constructor == s.ObjCollider) {
if (n.cldr.node.getComponent(p.default)) {
this.hurtCollisionData = n;
break;
}
}
}
};
e.prototype.getHurtDir = function() {
var t = .5 * (this.hurtCollisionData.minX + this.hurtCollisionData.maxX);
return this.node.x < t ? 1 : -1;
};
e.prototype.onWatching = function(t) {
t.length;
};
e.prototype.checkHurt = function() {
return this.smInvc.state != h.InvcState.on && null != this.hurtCollisionData;
};
e.prototype.beginInvcState = function(t) {
this.smInvc.begin(t);
};
return e = __decorate([ i ], e);
}(cc.Component);
o.default = d;
cc._RF.pop();
}, {
"./Attack": "Attack",
"./AttriForHero": "AttriForHero",
"./HeroUI": "HeroUI",
"./MovableObject": "MovableObject",
"./ObjCollider": "ObjCollider",
"./ObjColliderForWatch": "ObjColliderForWatch",
"./SMForHero": "SMForHero",
"./TerrainCollider": "TerrainCollider"
} ],
MovableObject: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "9f661uXsONL36sPsozhGAtf", "MovableObject");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, n.executionOrder);
o.VelocityMax = 15;
var c = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.xAccelEnabled = !0;
e.yAccelEnabled = !0;
e.xAccel = 0;
e.yAccel = 0;
e.xVelocity = 0;
e.yVelocity = 0;
e.xLastPos = 0;
e.yLastPos = 0;
e.xLastVelocity = 0;
e.yLastVelocity = 0;
return e;
}
e.prototype.update = function(t) {
this.xLastPos = this.node.x;
this.yLastPos = this.node.y;
this.xLastVelocity = this.xVelocity;
this.yLastVelocity = this.yVelocity;
this.xAccelEnabled && (this.xVelocity += this.xAccel);
this.xVelocity = Math.min(Math.max(this.xVelocity, -o.VelocityMax), o.VelocityMax);
this.node.x += this.xVelocity;
this.yAccelEnabled && (this.yVelocity += this.yAccel);
this.yVelocity = Math.min(Math.max(this.yVelocity, -o.VelocityMax), o.VelocityMax);
this.node.y += this.yVelocity;
};
e.prototype.getDir = function() {
var t = 0;
this.xVelocity > .001 ? t = 1 : this.xVelocity < -.001 && (t = -1);
var e = 0;
this.yVelocity > .001 ? e = 1 : this.yVelocity < -.001 && (e = -1);
return {
xDir: t,
yDir: e
};
};
return e = __decorate([ i, r(EXECUTION_ORDER.MovableObject) ], e);
}(cc.Component);
o.MovableObject = c;
cc._RF.pop();
}, {} ],
ObjColliderForWatch: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "7f51e1mkKlAB7UWTDcKu32B", "ObjColliderForWatch");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e._debugColor = cc.Color.YELLOW;
return e;
}
return e = __decorate([ i ], e);
}(t("./ObjCollider").ObjCollider));
o.default = r;
cc._RF.pop();
}, {
"./ObjCollider": "ObjCollider"
} ],
ObjCollider: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "1285aB1AudJHrqNa72cuLP1", "ObjCollider");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = n.executeInEditMode, s = function() {
this.cldr = null;
this.minX = 0;
this.maxX = 0;
this.minY = 0;
this.maxY = 0;
};
o.CollisionData = s;
var a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.callback = null;
e.size = cc.size(0, 0);
e.offset = cc.v2(0, 0);
e.subColliders = [];
e.showingInRunning = !1;
e.collisionDatas = [];
e._debugDrawer = null;
e._debugColor = cc.Color.WHITE;
return e;
}
o = e;
e.prototype.update = function(t) {
if (this.showingInRunning) {
if (!this._debugDrawer) {
this._debugDrawer = new _ccsg.GraphicsNode();
this.node._sgNode.addChild(this._debugDrawer, 99999);
this._debugDrawer.strokeColor = this._debugColor;
}
var e = this.node, o = this.size.width > 0 ? this.size.width : e.width, n = this.size.height > 0 ? this.size.height : e.height, i = -o * e.anchorX + this.offset.x, r = i + o, c = -n * e.anchorY + this.offset.y, s = c + n;
this._debugDrawer.clear();
this._debugDrawer.moveTo(i, c);
this._debugDrawer.lineTo(i, s);
this._debugDrawer.lineTo(r, s);
this._debugDrawer.lineTo(r, c);
this._debugDrawer.lineTo(i, c);
this._debugDrawer.close();
this._debugDrawer.stroke();
}
};
e.prototype.getMaxMinXY = function(t) {
void 0 === t && (t = null);
var e = this.node, o = this.size.width > 0 ? this.size.width : e.width, n = this.size.height > 0 ? this.size.height : e.height, i = -o * e.anchorX + this.offset.x, r = i + o, c = -n * e.anchorY + this.offset.y, s = c + n;
if (!t) return {
minX: i + e.x,
maxX: r + e.x,
minY: c + e.y,
maxY: s + e.y
};
var a = e._sgNode.getNodeToParentTransform(t.node.parent._sgNode), u = cc.rect(i, c, o, n), l = cc.v2(), h = cc.v2(), p = cc.v2(), d = cc.v2();
cc.obbApplyAffineTransform(u, a, l, h, p, d);
return {
minX: i = Math.min(l.x, h.x, p.x, d.x),
maxX: r = Math.max(l.x, h.x, p.x, d.x),
minY: c = Math.min(l.y, h.y, p.y, d.y),
maxY: s = Math.max(l.y, h.y, p.y, d.y)
};
};
e.prototype.onCollisionBy = function(t) {
this.collisionDatas.push(t);
};
e.prototype.excuteCallback = function() {
this.callback && this.callback(this.collisionDatas);
};
e.prototype.reset = function() {
this.collisionDatas = [];
};
__decorate([ r(cc.Size) ], e.prototype, "size", void 0);
__decorate([ r(cc.Vec2) ], e.prototype, "offset", void 0);
__decorate([ r([ o ]) ], e.prototype, "subColliders", void 0);
__decorate([ r ], e.prototype, "showingInRunning", void 0);
return e = o = __decorate([ i, c ], e);
var o;
}(cc.Component);
o.ObjCollider = a;
cc._RF.pop();
}, {} ],
ObjCollisionCtrlr: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "503echVggFCPJZ0uzclfObz", "ObjCollisionCtrlr");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = n.executionOrder, s = t("./ObjCollider"), a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.checkedLayers = [];
e.checkingTacticsString = "";
e.checkingTactics = [];
e.collisionDatas = [];
e.collisionDataLengths = [];
return e;
}
e.prototype.onLoad = function() {
for (var t = 0, e = this.checkingTacticsString.split(";"); t < e.length; t++) {
var o = e[t].split("-"), n = Number(o[0]), i = Number(o[1]);
myAssert("number" == typeof n && "number" == typeof i, "layer id must be number");
myAssert(0 <= n && n < this.checkedLayers.length, "layer id 1 wrong");
myAssert(0 <= i && i < this.checkedLayers.length, "layer id 2 wrong");
this.checkingTactics.push([ n, i ]);
}
for (var r = 0; r < this.checkedLayers.length; ++r) {
for (var c = [], a = 0; a < 1e3; ++a) c[a] = new s.CollisionData();
this.collisionDatas[r] = c;
this.collisionDataLengths[r] = 0;
}
};
e.prototype.update = function(t) {
this.createCollsionData();
this.checkByTictics();
this.excuteCollisionCallback();
};
e.prototype.createCollsionData = function() {
for (var t = 0; t < this.checkedLayers.length; ++t) {
this.collisionDataLengths[t] = 0;
for (var e = 0, o = this.checkedLayers[t].children; e < o.length; e++) {
var n = o[e];
if (n.activeInHierarchy) for (var i = 0, r = n.getComponents(s.ObjCollider); i < r.length; i++) {
var c = r[i];
if (c) {
c.enabled && this.saveCollsionDataAndResetObj(c, null, t);
for (var a = 0, u = c.subColliders; a < u.length; a++) {
var l = u[a];
l.enabled && this.saveCollsionDataAndResetObj(l, c, t);
}
}
}
}
}
};
e.prototype.saveCollsionDataAndResetObj = function(t, e, o) {
var n = t.getMaxMinXY(e), i = n.minX, r = n.maxX, c = n.minY, s = n.maxY, a = this.collisionDatas[o][this.collisionDataLengths[o]];
a.cldr = t;
a.minX = i;
a.maxX = r;
a.minY = c;
a.maxY = s;
++this.collisionDataLengths[o];
t.reset();
};
e.prototype.checkByTictics = function() {
for (var t = 0, e = this.checkingTactics; t < e.length; t++) {
var o = e[t], n = o[0], i = o[1];
this.check(this.collisionDatas[n], this.collisionDataLengths[n], this.collisionDatas[i], this.collisionDataLengths[i]);
}
};
e.prototype.check = function(t, e, o, n) {
for (var i = 0; i < e; ++i) for (var r = t[i], c = 0; c < n; ++c) {
var s = o[c];
if (r.maxX >= s.minX && r.minX <= s.maxX && r.maxY >= s.minY && r.minY <= s.maxY) {
r.cldr.onCollisionBy(s);
s.cldr.onCollisionBy(r);
}
}
};
e.prototype.excuteCollisionCallback = function() {
for (var t = 0; t < this.collisionDatas.length; t++) for (var e = this.collisionDatas[t], o = this.collisionDataLengths[t], n = 0; n < o; n++) {
e[n].cldr.excuteCallback();
}
};
__decorate([ r([ cc.Node ]) ], e.prototype, "checkedLayers", void 0);
__decorate([ r ], e.prototype, "checkingTacticsString", void 0);
return e = __decorate([ i, c(EXECUTION_ORDER.ObjCollider) ], e);
}(cc.Component);
o.default = a;
cc._RF.pop();
}, {
"./ObjCollider": "ObjCollider"
} ],
SMForHero: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "c601cDUlXhJOKwN2ueFuGhK", "SMForHero");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n, i = t("./TerrainCtrlr"), r = t("./HeroUI");
(function(t) {
t[t.stand = 0] = "stand";
t[t.jumpAccelerating = 1] = "jumpAccelerating";
t[t.jump = 2] = "jump";
t[t.move = 3] = "move";
t[t.dash = 4] = "dash";
t[t.hurt = 5] = "hurt";
})(n = o.ActState || (o.ActState = {}));
var c = function() {
function t(t, e) {
this.stateList = {};
this.curState = null;
this.curStateMachine = null;
this.hero = null;
this.hero = t;
this.stateList[n.stand] = new u();
this.stateList[n.jumpAccelerating] = new l();
this.stateList[n.jump] = new h();
this.stateList[n.move] = new p();
this.stateList[n.dash] = new d();
this.stateList[n.hurt] = new y();
this._setState(e);
this.curStateMachine.begin(this);
}
t.prototype._setState = function(t) {
this.curState = t;
this.curStateMachine = this.stateList[t];
};
t.prototype.changeStateTo = function(t) {
if (!this.stateList[t].can(this)) return null;
this.curStateMachine.end(this);
this._setState(t);
this.curStateMachine.begin(this);
};
t.prototype.machineUpdate = function(t) {
this.curStateMachine.update(t, this);
};
t.prototype.machineCheck = function() {
this.curStateMachine.check(this);
};
return t;
}();
o.SMForHeroMgr = c;
var s, a = function() {
function t() {}
t.prototype.can = function(t) {
return !0;
};
t.prototype.begin = function(t) {};
t.prototype.update = function(t, e) {};
t.prototype.check = function(t) {};
t.prototype.end = function(t) {};
return t;
}(), u = function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.begin = function(t) {
t.hero.ui.stand();
t.hero.attri.fillJumpAndDashCount();
t.hero.movableObj.xVelocity = 0;
};
e.prototype.check = function(t) {
t.hero.checkHurt() ? t.changeStateTo(n.hurt) : t.hero.terrainCollider.curYCollisionType == i.CollisionType.none ? t.changeStateTo(n.jump) : 0 != t.hero.xMoveDir && t.changeStateTo(n.move);
};
e.prototype.end = function(t) {
t.hero.ui.endStand();
};
return e;
}(a), l = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.time = 0;
return e;
}
e.prototype.can = function(t) {
var e = t.curState, o = e != n.jumpAccelerating && e != n.dash && e != n.hurt, i = t.hero.attri.jumpCount > 0;
return o && i;
};
e.prototype.begin = function(t) {
t.hero.ui.jumpUp();
t.hero.attri.jumpCount -= 1;
this.time = 0;
};
e.prototype.update = function(t, e) {
this.time += t;
var o = e.hero;
o.movableObj.xVelocity = o.xMoveDir * o.attri.xSpeed;
o.ui.setXUIDir(o.xMoveDir, r.UIDirLvType.move);
o.movableObj.yVelocity = o.attri.ySpeed;
};
e.prototype.check = function(t) {
t.hero.checkHurt() ? t.changeStateTo(n.hurt) : t.hero.terrainCollider.curYCollisionType != i.CollisionType.none ? t.changeStateTo(n.jump) : this.time > .3 && t.changeStateTo(n.jump);
};
e.prototype.end = function(t) {
t.hero.ui.endJumpUp();
};
return e;
}(a), h = function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.begin = function(t) {
t.hero.movableObj.getDir().yDir >= 0 ? t.hero.ui.jumpUp() : t.hero.ui.jumpDown();
};
e.prototype.update = function(t, e) {
var o = e.hero;
o.movableObj.getDir().yDir >= 0 ? o.ui.jumpUp() : o.ui.jumpDown();
o.movableObj.xVelocity = o.xMoveDir * o.attri.xSpeed;
o.ui.setXUIDir(o.xMoveDir, r.UIDirLvType.move);
};
e.prototype.check = function(t) {
var e = t.hero;
e.checkHurt() ? t.changeStateTo(n.hurt) : e.terrainCollider.curYCollisionType != i.CollisionType.none && e.movableObj.getDir().yDir <= 0 && e.movableObj.yLastVelocity <= 0 && (0 == e.xMoveDir ? t.changeStateTo(n.stand) : t.changeStateTo(n.move));
};
e.prototype.end = function(t) {
t.hero.ui.endJumpDown();
};
return e;
}(a), p = function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype.begin = function(t) {
t.hero.ui.move();
t.hero.attri.fillJumpAndDashCount();
};
e.prototype.update = function(t, e) {
var o = e.hero;
o.movableObj.xVelocity = o.xMoveDir * o.attri.xSpeed;
o.ui.setXUIDir(o.xMoveDir, r.UIDirLvType.move);
};
e.prototype.check = function(t) {
t.hero.checkHurt() ? t.changeStateTo(n.hurt) : t.hero.terrainCollider.curYCollisionType == i.CollisionType.none ? t.changeStateTo(n.jump) : 0 == t.hero.xMoveDir && t.changeStateTo(n.stand);
};
e.prototype.end = function(t) {
t.hero.ui.endMove();
};
return e;
}(a), d = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.time = 0;
e.dashDir = 0;
return e;
}
e.prototype.can = function(t) {
var e = t.curState, o = e != n.dash && e != n.hurt, i = t.hero.attri.dashCount > 0;
return o && i;
};
e.prototype.begin = function(t) {
t.hero.ui.dash();
t.hero.attri.dashCount -= 1;
this.time = 0;
this.dashDir = t.hero.ui.xUIDirs[r.UIDirLvType.move];
t.hero.movableObj.yVelocity = 0;
t.hero.movableObj.yAccelEnabled = !1;
};
e.prototype.update = function(t, e) {
this.time += t;
e.hero.movableObj.xVelocity = 5 * this.dashDir;
};
e.prototype.check = function(t) {
t.hero.checkHurt() ? t.changeStateTo(n.hurt) : this.time > .4 && (t.hero.terrainCollider.curYCollisionType == i.CollisionType.none ? t.changeStateTo(n.jump) : 0 == t.hero.xMoveDir ? t.changeStateTo(n.stand) : t.changeStateTo(n.move));
};
e.prototype.end = function(t) {
t.hero.ui.endDash();
t.hero.movableObj.yAccelEnabled = !0;
};
return e;
}(a), y = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.hurtMoveDir = 0;
return e;
}
e.prototype.begin = function(t) {
var e = t.hero, o = e.getHurtDir();
e.ui.hurt();
e.ui.setXUIDir(o, r.UIDirLvType.hurt);
this.hurtMoveDir = -1 * o;
e.movableObj.yVelocity = 2;
};
e.prototype.update = function(t, e) {
e.hero.movableObj.xVelocity = 2 * this.hurtMoveDir;
};
e.prototype.check = function(t) {
var e = t.hero, o = e.movableObj.getDir().yDir, r = e.movableObj.yLastVelocity;
e.terrainCollider.curYCollisionType != i.CollisionType.none && o <= 0 && r <= 0 && (0 == e.xMoveDir ? t.changeStateTo(n.stand) : t.changeStateTo(n.move));
};
e.prototype.end = function(t) {
t.hero.ui.endHurt();
t.hero.ui.setXUIDir(0, r.UIDirLvType.hurt);
t.hero.beginInvcState(t.hero.attri.invcTimeForHurt);
};
return e;
}(a);
(function(t) {
t[t.on = 0] = "on";
t[t.off = 1] = "off";
})(s = o.InvcState || (o.InvcState = {}));
var f = function() {
function t(t) {
this.hero = null;
this.state = s.off;
this.time = 0;
this.totalTime = 0;
this.hero = t;
}
t.prototype.begin = function(t) {
this.state = s.on;
this.time = 0;
this.totalTime = t;
this.hero.ui.setInvincibleEnabled(!0);
};
t.prototype.machineUpdate = function(t) {
if (this.state != s.off) {
this.time += t;
this.time > this.totalTime && this.end();
}
};
t.prototype.end = function() {
this.state = s.off;
this.hero.ui.setInvincibleEnabled(!1);
};
return t;
}();
o.SMForHeroInvcMgr = f;
cc._RF.pop();
}, {
"./HeroUI": "HeroUI",
"./TerrainCtrlr": "TerrainCtrlr"
} ],
ShowCtrlArea: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "8a688zp4jpMWrgpUZRvAOR3", "ShowCtrlArea");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = n.property, c = n.executeInEditMode, s = t("./HeroCtrlr"), a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.ctrl = null;
e.moveArea = null;
e.watchArea = null;
e.jumpArea = null;
e.dashArea = null;
return e;
}
e.prototype.onLoad = function() {
var t = cc.find("canvas").getContentSize();
this.moveArea.setPosition(0, 0);
this.moveArea.setContentSize(t.width * this.ctrl.moveWRate, t.height * this.ctrl.moveHRate);
this.watchArea.setPosition(0, t.height * this.ctrl.moveHRate);
this.watchArea.setContentSize(t.width * this.ctrl.moveWRate, t.height * (1 - this.ctrl.moveHRate));
this.jumpArea.setPosition(t.width, 0);
this.jumpArea.setContentSize(t.width * (1 - this.ctrl.jumpXRate), t.height * this.ctrl.jumpHRate);
this.dashArea.setPosition(t.width, t.height * this.ctrl.jumpHRate);
this.dashArea.setContentSize(t.width * (1 - this.ctrl.jumpXRate), t.height * (1 - this.ctrl.jumpHRate));
};
__decorate([ r(s.default) ], e.prototype, "ctrl", void 0);
__decorate([ r(cc.Node) ], e.prototype, "moveArea", void 0);
__decorate([ r(cc.Node) ], e.prototype, "watchArea", void 0);
__decorate([ r(cc.Node) ], e.prototype, "jumpArea", void 0);
__decorate([ r(cc.Node) ], e.prototype, "dashArea", void 0);
return e = __decorate([ i, c ], e);
}(cc.Component);
o.default = a;
cc._RF.pop();
}, {
"./HeroCtrlr": "HeroCtrlr"
} ],
TerrainCollider: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "934e6f54IFPRqa09xBo/8Up", "TerrainCollider");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n = cc._decorator, i = n.ccclass, r = (n.property, n.executionOrder), c = t("./MovableObject"), s = t("./TerrainCtrlr"), a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.movableObj = null;
e.terrainCtrlr = null;
e.curXCollisionType = s.CollisionType.none;
e.curYCollisionType = s.CollisionType.none;
e.edgeType = null;
e.xOutRangeDir = 0;
e.yOutRangeDir = 0;
return e;
}
e.prototype.onLoad = function() {
requireComponents(this, [ c.MovableObject ]);
this.movableObj = this.getComponent(c.MovableObject);
this.terrainCtrlr = cc.director.getScene().getComponentInChildren(s.TerrainCtrlr);
};
e.prototype.update = function(t) {
var e = this.node.x, o = this.movableObj.getDir(), n = o.xDir, i = o.yDir, r = this.node.getContentSize(), a = this.node.getAnchorPoint(), u = s.CollisionType.none;
if (0 != n) {
var l = this.node.x - r.width * a.x + (n > 0 ? r.width : 0), h = (f = this.node.y - r.height * a.y) + r.height - 1;
if ((u = this.terrainCtrlr.checkCollideInVerticalLine(l, f, h)) == s.CollisionType.entity) {
var p = this.terrainCtrlr.getDistanceToTileSide(l, n), d = this.node.x - p;
d = n > 0 ? Math.max(d, this.movableObj.xLastPos) : Math.min(d, this.movableObj.xLastPos);
this.node.x = d;
}
}
if (0 != i) {
var y = (l = this.node.x - r.width * a.x) + r.width - 1, f = this.node.y - r.height * a.y + (i > 0 ? r.height : 0), v = this.terrainCtrlr.checkCollideInHorizontalLine(l, y, f, n), g = v.type, m = v.edgeType;
this.curYCollisionType = g;
this.edgeType = i < 0 && g != s.CollisionType.none ? m : null;
if (this.curYCollisionType == s.CollisionType.entity) {
p = this.terrainCtrlr.getDistanceToTileSide(f, i);
this.node.y -= p;
this.movableObj.yVelocity = 0;
} else if (this.curYCollisionType == s.CollisionType.slope) {
if (u == s.CollisionType.entity) {
p = this.terrainCtrlr.getDistanceToTileSide(f, i);
this.node.y -= p;
}
} else if (this.curYCollisionType == s.CollisionType.platform) if (i < 0) {
p = this.terrainCtrlr.getDistanceToTileSide(f, i);
var T = this.node.y - p;
if (this.movableObj.yLastPos - T > -.01) {
this.node.y = T;
this.movableObj.yVelocity = 0;
} else this.curYCollisionType = s.CollisionType.none;
} else this.curYCollisionType = s.CollisionType.none;
}
if (0 != n && u == s.CollisionType.entity) {
l = e - r.width * a.x + (n > 0 ? r.width : 0), h = (f = this.node.y - r.height * a.y) + r.height - 1;
this.curXCollisionType = this.terrainCtrlr.checkCollideInVerticalLine(l, f, h);
if (this.curXCollisionType == s.CollisionType.entity) {
this.movableObj.xVelocity = 0;
this.edgeType = s.CollisionType.entity;
} else this.node.x = e;
}
l = this.node.x - r.width * a.x, f = this.node.y - r.height * a.y;
var _ = this.terrainCtrlr.getSlopeOffset(l, f, 1);
if (null != _) if (_ >= -.01) {
this.node.y += _;
this.curYCollisionType = s.CollisionType.slope;
} else {
this.curYCollisionType = s.CollisionType.none;
this.edgeType = null;
} else {
y = l + r.width - 1;
var C = this.terrainCtrlr.getSlopeOffset(y, f, -1);
if (null != C) if (C > -.01) {
this.node.y += C;
this.curYCollisionType = s.CollisionType.slope;
} else {
this.curYCollisionType = s.CollisionType.none;
this.edgeType = null;
}
}
(i < 0 && this.curYCollisionType == s.CollisionType.entity && this.edgeType != s.CollisionType.none || this.curYCollisionType == s.CollisionType.slope || this.edgeType == s.CollisionType.slope) && (this.movableObj.yVelocity = -c.VelocityMax);
if (0 != n) {
var b = this.node.x + r.width * (.5 - a.x);
if (b < 0) {
this.node.x -= b;
this.xOutRangeDir = -1;
} else if (this.terrainCtrlr.terrainSize.width < b) {
this.node.x -= b - this.terrainCtrlr.terrainSize.width;
this.xOutRangeDir = 1;
} else this.xOutRangeDir = 0;
} else this.xOutRangeDir = 0;
if (0 != i) {
var x = this.node.y + r.height * (.5 - a.y);
x < 0 ? this.yOutRangeDir = -1 : this.terrainCtrlr.terrainSize.height < x ? this.yOutRangeDir = 1 : this.yOutRangeDir = 0;
} else this.yOutRangeDir = 0;
};
return e = __decorate([ i, r(EXECUTION_ORDER.TerrainCollider) ], e);
}(cc.Component);
o.default = a;
cc._RF.pop();
}, {
"./MovableObject": "MovableObject",
"./TerrainCtrlr": "TerrainCtrlr"
} ],
TerrainCtrlr: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "4430d8xAuNPgoUn8Ds+KPvx", "TerrainCtrlr");
Object.defineProperty(o, "__esModule", {
value: !0
});
var n, i = cc._decorator, r = i.ccclass, c = i.property;
(function(t) {
t[t.none = 0] = "none";
t[t.platform = 1] = "platform";
t[t.slope = 2] = "slope";
t[t.entity = 3] = "entity";
})(n = o.CollisionType || (o.CollisionType = {}));
var s = function() {};
o.TileAttris = s;
var a = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.dir = 0;
e.x = 0;
e.y = 0;
return e;
}
return e;
}(s);
o.SlopeAttris = a;
var u = function(t) {
__extends(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.tiledMap = null;
e.tileNumSize = null;
e.terrainSize = null;
e.collidableLayer = null;
e.collisionCache = {};
e.collisionAttriCache = {};
return e;
}
e.prototype.onLoad = function() {
this.tileNumSize = this.tiledMap.getMapSize();
this.terrainSize = new cc.Size(32 * this.tileNumSize.width, 32 * this.tileNumSize.height - .001);
this.collidableLayer = this.tiledMap.getLayer("collision");
this.collidableLayer.enabled = !1;
};
e.prototype._getTileIndex = function(t, e) {
return {
tileX: Math.floor(t / 32),
tileY: Math.floor((this.terrainSize.height - e) / 32)
};
};
e.prototype._getCacheKey = function(t, e) {
return 1e3 * t + e;
};
e.prototype.checkCollideAt = function(t, e) {
var o = this._getTileIndex(t, e), i = o.tileX, r = o.tileY, c = this._getCacheKey(i, r), s = this.collisionCache[c];
if (s) return s;
if (i < 0 || this.tileNumSize.width <= i || r < 0 || this.tileNumSize.height <= r) return n.none;
var u = this.collidableLayer.getTileGIDAt(i, r);
if (!u) return n.none;
var l = this.tiledMap.getPropertiesForGID(u);
if (!l) return n.none;
var h = parseInt(l.collidable);
this.collisionCache[c] = h;
var p = null;
switch (h) {
case n.slope:
p = new a();
var d = parseInt(l.dir);
p.dir = d;
var y = i, f = r;
d > 0 && (y += 1);
f = this.tileNumSize.height - f - 1;
p.x = 32 * y;
p.y = 32 * f;
}
this.collisionAttriCache[c] = p;
return h;
};
e.prototype.getTileAttris = function(t, e) {
var o = this._getTileIndex(t, e), n = o.tileX, i = o.tileY, r = this._getCacheKey(n, i);
return this.collisionAttriCache[r];
};
e.prototype.checkCollideInVerticalLine = function(t, e, o) {
for (var i = n.none, r = e; ;) {
var c = this.checkCollideAt(t, r);
c > i && (i = c);
if ((r += 32) >= o) break;
}
var s = this.checkCollideAt(t, o);
s > i && (i = s);
return i;
};
e.prototype.checkCollideInHorizontalLine = function(t, e, o, i) {
for (var r = n.none, c = t, s = []; ;) {
var a = this.checkCollideAt(c, o);
s.push(a);
a > r && (r = a);
if ((c += 32) >= e) break;
}
var u = this.checkCollideAt(e, o);
s.push(u);
u > r && (r = u);
var l = null;
if (0 != i) {
i > 0 && (s = s.reverse());
for (var h = 0, p = s; h < p.length; h++) {
var d = p[h];
if (d != n.none && d != n.slope) break;
l = d;
}
}
return {
type: r,
edgeType: l
};
};
e.prototype.getDistanceToTileSide = function(t, e) {
return e > 0 ? t % 32 : t % 32 - 32;
};
e.prototype.getSlopeOffset = function(t, e, o) {
if (this.checkCollideAt(t, e) != n.slope) return null;
var i = this.getTileAttris(t, e);
if (i.dir != o) return null;
var r = Math.abs(i.x - t);
return i.y + r - e;
};
__decorate([ c(cc.TiledMap) ], e.prototype, "tiledMap", void 0);
return e = __decorate([ r ], e);
}(cc.Component);
o.TerrainCtrlr = u;
cc._RF.pop();
}, {} ]
}, {}, [ "Global", "Attack", "AttriForHero", "BTBase", "BTNode", "BTNodeActSet", "BTNodeAction", "BTNodeActionEnd", "BTNodeActionUntil", "BTNodeCdtion", "BTNodeCdtionBool", "BTNodeCdtionNum", "BTNodeGroup", "BTNodeParallel", "BTNodeSelect", "BTNodeSequence", "CameraCtrlr", "CanvasCtrlr", "CtrlIndicator", "Enemy", "Gravity", "Hero", "HeroCtrlr", "HeroUI", "MovableObject", "ObjCollider", "ObjColliderForWatch", "ObjCollisionCtrlr", "SMForHero", "ShowCtrlArea", "TerrainCollider", "TerrainCtrlr" ]);