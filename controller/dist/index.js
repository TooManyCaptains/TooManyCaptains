"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const colors = require("colors/safe");
const client_1 = require("./client");
const panels_1 = require("./panels");
const buttons_1 = require("./buttons");
const types_1 = require("./types");
const ButtonController_1 = require("./ButtonController");
const PanelController_1 = require("./PanelController");
const LightController_1 = require("./LightController");
(function main() {
    let gameState = 'before';
    function onGameStateChanged(state) {
        if (state === gameState) {
            return;
        }
        console.info('new game state: ', state);
        gameState = state;
        updatePanelLights();
    }
    // Create a client to interact with the server
    const url = process.env.GANGLIA_SERVER_URL || 'http://server.toomanycaptains.com';
    const client = new client_1.Client(url, onGameStateChanged, () => panelController.emitAll());
    // Create a panel controller to manage plugging and unplugging wires into panels
    const panelController = new PanelController_1.PanelController(panels_1.panels, onEvent, () => gameState);
    // Create a button controller to manage button presses
    const buttonController = new ButtonController_1.ButtonController(buttons_1.buttons, onEvent, () => gameState);
    // Create a light controller for the wire/panel LEDs
    const numLights = lodash_1.flatten(panels_1.panels.map(p => p.lightIndicies)).length;
    const lightController = new LightController_1.LightController(numLights);
    // Update lights (all at once, since they are daisy-chained via PWM)
    function updatePanelLights() {
        let lights = [];
        if (gameState === 'before') {
            lightController.startFlashingLights(types_1.LightColor.green, 6, 100000);
        }
        else if (gameState === 'over') {
            lightController.startFlashingLights(types_1.LightColor.red);
        }
        else if (gameState === 'start') {
            lightController.stopFlashingLights();
            lights = lodash_1.flatten(panelController.panels.map(panel => panel.lights));
            lightController.setLights(lights);
        }
    }
    // Dispatch event to client and update other state as needed
    function onEvent(event) {
        console.info(`${event.name} => ${event.data}`);
        client.emit(event);
        updatePanelLights();
    }
    console.info(`\n${colors.bold('Wire poll rate')}: ${1000 / panelController.pollRateMsec} Hz`);
    console.info(`${colors.bold('Button poll rate')}: ${1000 / buttonController.pollRateMsec} Hz`);
    console.info(`${colors.bold('Server')}: ${client.url}\n`);
    updatePanelLights();
    function teardownAndExitCleanly() {
        lightController.teardown();
        process.nextTick(() => process.exit(0));
    }
    process.on('SIGINT', teardownAndExitCleanly);
    process.on('SIGTERM', teardownAndExitCleanly);
})();
//# sourceMappingURL=index.js.map