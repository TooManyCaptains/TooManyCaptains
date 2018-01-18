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
        this.pins = [];
        this.lights = [];
        this.lightIndicies = [];
        this.buttonLightPins = [];
    }
}
exports.Panel = Panel;
// export abstract class PolledController<T, E> {
//   public readonly pollRateMsec: number
//   public readonly onEvent: (event: Event) => void
//   protected abstract poll(): void
//   protected abstract setup(): void
//
//   constructor(objects: T[], )
// }
//# sourceMappingURL=types.js.map