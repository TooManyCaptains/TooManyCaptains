"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const ws281x = require('rpi-ws281x-native'); // tslint:disable-line
class LightController {
    constructor(numLights) {
        this.lights = [];
        this.lightsFlashingTimer = null;
        this.lightsFlashingCounter = 0;
        this.numLights = numLights;
        this.setup();
    }
    setLights(lights) {
        this.lights = lights;
        this.updateLights();
    }
    teardown() {
        ws281x.reset();
    }
    startFlashingLights(color, limit = this.numLights, delay = 750) {
        this.stopFlashingLights();
        const op = () => {
            if (this.lightsFlashingCounter % 2 === 0) {
                this.setLights(_.times(limit, index => ({ index, color })));
            }
            else {
                this.setLights([]);
            }
            this.lightsFlashingCounter += 1;
        };
        op();
        this.lightsFlashingTimer = global.setInterval(op, delay);
    }
    stopFlashingLights() {
        this.lightsFlashingCounter = 0;
        if (this.lightsFlashingTimer) {
            global.clearInterval(this.lightsFlashingTimer);
        }
    }
    updateLights() {
        const pixelData = new Uint32Array(this.numLights);
        _.times(this.numLights, i => {
            const light = this.lights.find(({ index }) => index === i);
            if (light) {
                pixelData[i] = light.color;
            }
        });
        ws281x.render(pixelData);
    }
    setup() {
        ws281x.init(this.numLights);
    }
}
exports.LightController = LightController;
//# sourceMappingURL=LightController.js.map