"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const types_1 = require("./types");
const rpio = require("rpio");
class WeaponsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'weapons';
        this.pins = [40, 38, 36];
        this.lightIndicies = _.range(6);
        this.buttonLightPins = [];
    }
    update(colorPositions, gameState) {
        const isButtonLit = true;
        _.forEach(this.buttonLightPins, pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        // Set LED lights for later batch-update
        this.lights = [];
        colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => {
            this.lights.push({
                index: this.lightIndicies[position],
                color: types_1.LightColor[color],
            });
            this.lights.push({
                index: this.lightIndicies[position + 1],
                color: types_1.LightColor[color],
            });
        });
        // this.lights = colorPositions
        //   .filter(({ position }) => position !== null)
        //   .map(({ color, position }) => ({
        //     index: this.lightIndicies[position!],
        //     color: LightColor[color],
        //   }));
    }
}
class ThrustersPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'thrusters';
        this.pins = [16, 18];
        this.lightIndicies = _.range(10, 14);
        this.buttonLightPins = [];
    }
    update(colorPositions, gameState) {
        const isButtonLit = colorPositions.length > 0 && gameState === 'in_game';
        _.forEach(this.buttonLightPins, pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.purple,
        }));
    }
}
class ShieldsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'shields';
        this.pins = [21, 23, 19]; //
        this.lightIndicies = _.range(16, 22); // LEDs were installed backwards
    }
    update(colorPositions) {
        this.lights = colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => ({
            index: this.lightIndicies[position],
            color: types_1.LightColor[color],
        }));
    }
}
class RepairsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'repairs';
        this.pins = [36, 38, 40];
        this.lightIndicies = _.range(24, 30); // LEDs were installed backwards
    }
    update(colorPositions) {
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.green,
        }));
    }
}
const panels = [
    new WeaponsPanel(),
    new ThrustersPanel(),
    new ShieldsPanel(),
    new RepairsPanel(),
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map