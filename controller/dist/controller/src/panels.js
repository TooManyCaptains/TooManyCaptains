"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const lodash_1 = require("lodash");
const types_1 = require("./types");
class WeaponsPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.subsystem = 'weapons';
        this.pins = [40, 38, 36];
        this.lightIndicies = lodash_1.range(6);
        this.buttonLightPins = [];
    }
    update(gameState) {
        // Update button light
        const isButtonLit = true;
        this.buttonLightPins.forEach(pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        this.connections.forEach(({ color, position }) => {
            lodash_1.range(pixelsPerPosition).forEach(i => {
                this.lights.push({
                    index: this.lightIndicies[i + position * pixelsPerPosition],
                    color: types_1.LightColor[color],
                });
            });
        });
    }
}
class ThrustersPanel extends types_1.Panel {
    constructor() {
        super(...arguments);
        this.subsystem = 'thrusters';
        this.pins = [18, 16];
        this.lightIndicies = lodash_1.range(9, 13);
        this.buttonLightPins = [];
    }
    update(gameState) {
        const isButtonLit = this.connections.length > 0 && gameState === 'in_game';
        this.buttonLightPins.forEach(pin => {
            rpio.write(pin, isButtonLit ? rpio.HIGH : rpio.LOW);
        });
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        this.connections.forEach(({ color, position }) => {
            lodash_1.range(pixelsPerPosition).forEach(i => {
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
        this.subsystem = 'repairs';
        this.pins = [26, 24, 22];
        this.lightIndicies = lodash_1.range(16, 22);
    }
    update() {
        // this.lights = _.times(colorPositions.length, i => ({
        //   index: this.lightIndicies[i],
        //   color: LightColor.green,
        // }));
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        this.connections.forEach(({ color, position }) => {
            lodash_1.range(pixelsPerPosition).forEach(i => {
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
        this.subsystem = 'shields';
        this.pins = [8, 12, 10];
        this.lightIndicies = lodash_1.range(25, 32);
    }
    update() {
        // Set LED lights for later batch-update
        this.lights = [];
        const pixelsPerPosition = Math.floor(this.lightIndicies.length / this.pins.length);
        this.connections.forEach(({ color, position }) => {
            lodash_1.range(pixelsPerPosition).forEach(i => {
                this.lights.push({
                    index: this.lightIndicies[i + position * pixelsPerPosition],
                    color: types_1.LightColor[color],
                });
            });
        });
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