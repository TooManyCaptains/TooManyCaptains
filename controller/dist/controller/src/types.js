"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LightColor;
(function (LightColor) {
    LightColor[LightColor["red"] = 16711680] = "red";
    LightColor[LightColor["green"] = 65280] = "green";
    LightColor[LightColor["blue"] = 255] = "blue";
    LightColor[LightColor["yellow"] = 16751104] = "yellow";
    LightColor[LightColor["orange"] = 16753920] = "orange";
    LightColor[LightColor["purple"] = 8388736] = "purple";
})(LightColor = exports.LightColor || (exports.LightColor = {}));
class Panel {
    constructor() {
        this.lights = [];
        this.connections = [];
        this.pins = [];
        this.lightIndicies = [];
        this.buttonLightPins = [];
    }
}
exports.Panel = Panel;
//# sourceMappingURL=types.js.map