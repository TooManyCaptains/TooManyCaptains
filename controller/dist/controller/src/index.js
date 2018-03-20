"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const client_1 = require("./client");
const panels_1 = require("./panels");
const buttons_1 = require("./buttons");
const types_1 = require("./types");
const ButtonController_1 = require("./ButtonController");
const PanelController_1 = require("./PanelController");
const LightController_1 = require("./LightController");
(function main() {
    let gameState = 'wait_for_cards';
    function onPacket(packet) {
        if (packet.kind === 'gamestate') {
            // Update local copy of game state if different
            gameState = packet.state;
            // Forget all wire connections, causing the next poll
            // to report the connections to the server.
            panelController.resetConnections();
            console.info('new game state: ', gameState);
            updatePanelLights();
        }
    }
    function sendPacket(packet) {
        updatePanelLights();
        client.sendPacket(packet);
    }
    // Create a client to interact with the server
    const url = process.env.GANGLIA_SERVER_URL || 'http://starship:9000';
    const client = new client_1.Client(url, onPacket);
    // Create a panel controller to manage plugging and unplugging wires into panels
    const panelController = new PanelController_1.PanelController(panels_1.panels, sendPacket, () => gameState);
    // Create a button controller to manage button presses
    const buttonController = new ButtonController_1.ButtonController(buttons_1.buttons, sendPacket, () => gameState);
    // Create a light controller for the wire/panel LEDs
    // const numLights = flatten(panels.map(p => p.lightIndicies)).length;
    // XXX: Hacky way to calculate num lights. The whole light indexing
    // system should be re-thought since ColorPositions no longer map 1:1
    // with LED pixels (2 pixels per color position).
    const numLights = lodash_1.last(lodash_1.last(panels_1.panels).lightIndicies);
    const lightController = new LightController_1.LightController(numLights);
    // Update lights (all at once, since they are daisy-chained via PWM)
    function updatePanelLights() {
        let lights = [];
        if (gameState === 'wait_for_cards') {
            lightController.setAllLightToColor(types_1.LightColor.green);
        }
        else if (gameState === 'game_over') {
            lightController.startFlashingLights(types_1.LightColor.red);
        }
        else if (gameState === 'in_game') {
            lights = lodash_1.flatten(panelController.panels.map(panel => panel.lights));
            lightController.setLights(lights);
        }
        else {
            // clear lights
            lightController.setAllLightToColor(0);
        }
    }
    console.info(`\nWire poll rate: ${1000 / panelController.pollRateMsec} Hz`);
    console.info(`Button poll rate: ${1000 / buttonController.pollRateMsec} Hz`);
    console.info(`Server ${client.url}\n`);
    updatePanelLights();
    function teardownAndExitCleanly() {
        lightController.teardown();
        process.nextTick(() => process.exit(0));
    }
    process.on('SIGINT', teardownAndExitCleanly);
    process.on('SIGTERM', teardownAndExitCleanly);
})();
//# sourceMappingURL=index.js.map