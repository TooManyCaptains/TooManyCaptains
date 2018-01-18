"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const types_1 = require("./types");
const rpio = require("rpio");
class WeaponsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'weapons';
        this.pins = [15, 13, 11];
        this.lightIndicies = [0, 1, 2];
        this.buttonLightPins = [24];
    }
    toData(colorPositions) {
        return _.map(colorPositions, 'color');
    }
    update(colorPositions, gameState) {
        const isButtonLit = true;
        _.forEach(this.buttonLightPins, pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        // Set LED lights for later batch-update
        this.lights = colorPositions
            .filter(({ position }) => position !== null)
            .map(({ color, position }) => ({
            index: this.lightIndicies[position],
            color: types_1.LightColor[color],
        }));
    }
}
class ShieldsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'shields';
        this.pins = [21, 23, 19]; //
        this.lightIndicies = [5, 4, 3]; // LEDs were installed backwards
    }
    toData(colorPositions) {
        return _.map(colorPositions, 'color');
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
class PropulsionPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'propulsion';
        this.pins = [33, 35];
        this.lightIndicies = [6, 7];
        this.buttonLightPins = [26, 28];
    }
    toData(colorPositions) {
        return colorPositions.length;
    }
    update(colorPositions, gameState) {
        const isButtonLit = colorPositions.length > 0 && gameState === 'start';
        _.forEach(this.buttonLightPins, pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.purple,
        }));
    }
}
class RepairsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'repairs';
        this.pins = [27, 29, 31];
        this.lightIndicies = [10, 9, 8]; // LEDs were installed backwards
    }
    toData(colorPositions) {
        return colorPositions.length;
    }
    update(colorPositions) {
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.green,
        }));
    }
}
class CommunicationsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'communications';
        this.pins = [37];
        this.lightIndicies = [11];
    }
    toData(colorPositions) {
        return colorPositions.length > 0;
    }
    update(colorPositions) {
        this.lights = _.times(colorPositions.length, i => ({
            index: this.lightIndicies[i],
            color: types_1.LightColor.red,
        }));
    }
}
const panels = [
    new WeaponsPanel(),
    new ShieldsPanel(),
    new PropulsionPanel(),
    new RepairsPanel(),
    new CommunicationsPanel(),
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map