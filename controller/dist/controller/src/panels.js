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
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        colorPositions
            .filter(({ position }) => position !== null)
            .forEach(({ color, position }) => {
            _.range(pixelsPerPosition).forEach(i => {
                this.lights.push({
                    index: this.lightIndicies[i + position * pixelsPerPosition],
                    color: types_1.LightColor[color],
                });
            });
        });
        console.log(this.lights);
    }
}
class ThrustersPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'thrusters';
        this.pins = [18, 16];
        this.lightIndicies = _.range(9, 13);
        this.buttonLightPins = [];
    }
    update(colorPositions, gameState) {
        const isButtonLit = colorPositions.length > 0 && gameState === 'in_game';
        _.forEach(this.buttonLightPins, pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        colorPositions
            .filter(({ position }) => position !== null)
            .forEach(({ color, position }) => {
            _.range(pixelsPerPosition).forEach(i => {
                this.lights.push({
                    index: this.lightIndicies[i + position * pixelsPerPosition],
                    color: types_1.LightColor.purple,
                });
            });
        });
    }
}
class RepairsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'repairs';
        this.pins = [26, 24, 22];
        this.lightIndicies = _.range(16, 22);
    }
    update(colorPositions) {
        // this.lights = _.times(colorPositions.length, i => ({
        //   index: this.lightIndicies[i],
        //   color: LightColor.green,
        // }));
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        colorPositions
            .filter(({ position }) => position !== null)
            .forEach(({ color, position }) => {
            _.range(pixelsPerPosition).forEach(i => {
                this.lights.push({
                    index: this.lightIndicies[i + position * pixelsPerPosition],
                    color: types_1.LightColor.green,
                });
            });
        });
    }
}
class ShieldsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.name = 'shields';
        this.pins = [8, 12, 10];
        this.lightIndicies = _.range(25, 32);
    }
    update(colorPositions) {
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        colorPositions
            .filter(({ position }) => position !== null)
            .forEach(({ color, position }) => {
            _.range(pixelsPerPosition).forEach(i => {
                this.lights.push({
                    index: this.lightIndicies[i + position * pixelsPerPosition],
                    color: types_1.LightColor[color],
                });
            });
        });
        console.log(this.lights);
    }
}
const panels = [
    new WeaponsPanel(),
    new ThrustersPanel(),
    new RepairsPanel(),
    new ShieldsPanel(),
];
exports.panels = panels;
//# sourceMappingURL=panels.js.map