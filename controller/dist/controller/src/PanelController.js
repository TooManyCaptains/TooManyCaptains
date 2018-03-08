"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const rpio = require("rpio");
const wires = [
    {
        color: 'blue',
        pin: 31,
    },
    {
        color: 'red',
        pin: 29,
    },
    {
        color: 'yellow',
        pin: 27,
    },
];
class PanelController {
    constructor(panels, packetHandler, getGameState) {
        this.pollRateMsec = 250;
        this.panels = [];
        this.connections = [];
        this.getGameState = getGameState;
        this.sendPacket = packetHandler;
        this.panels = panels;
        this.setup();
        // Begin polling for wire connections
        setInterval(this.poll.bind(this), this.pollRateMsec);
    }
    resetConnections() {
        console.log('resetting connections');
        this.connections = [];
        this.poll();
    }
    setup() {
        // Set up wire pins for writing
        wires.forEach(({ pin }) => {
            rpio.open(pin, rpio.OUTPUT, rpio.LOW);
            rpio.pud(pin, rpio.PULL_DOWN);
        });
        // Set up button light pins for writing
        _.flatten(_.map(this.panels, 'buttonLightPins')).forEach(pin => {
            rpio.open(pin, rpio.OUTPUT, rpio.LOW);
            rpio.pud(pin, rpio.PULL_DOWN);
        });
        // Set up all panel wire pins for reading
        _.flatten(_.map(this.panels, 'pins')).forEach(pin => {
            rpio.open(pin, rpio.INPUT);
            rpio.pud(pin, rpio.PULL_DOWN);
        });
    }
    poll() {
        const newConnections = this.getConnections();
        // console.log(newConnections);
        // If there were no new/changed connections, just return early
        if (_.isEqual(newConnections, this.connections)) {
            return;
        }
        console.log(_.difference(newConnections, this.connections));
        // Update panels
        this.panels.forEach(panel => {
            panel.connections = newConnections.filter(conn => conn.panel.subsystem === panel.subsystem);
            panel.update(this.getGameState());
        });
        // Send
        this.sendConnections();
        this.connections = newConnections;
    }
    sendConnections() {
        const configurations = this.panels.map(panel => ({
            subsystem: panel.subsystem,
            colorPositions: panel.connections.map(({ color, position }) => ({
                color,
                position,
            })),
        }));
        const packet = {
            kind: 'wiring',
            configurations,
        };
        console.log(JSON.stringify(packet));
        this.sendPacket(packet);
    }
    getConnectionForWire(wire) {
        // Set all wire pins to LOW
        wires.forEach(w => rpio.write(w.pin, rpio.LOW));
        // Set the we're testing in to HIGH
        rpio.write(wire.pin, rpio.HIGH);
        // Find the panel that the wire is plugged in and what position it is in (i.e. order)
        let position = -1;
        const panel = this.panels.find(({ subsystem, pins }) => {
            return pins.some((p, i) => {
                const wireIsConnectedToPin = Boolean(rpio.read(p));
                console.log(p, wireIsConnectedToPin);
                if (wireIsConnectedToPin) {
                    position = i;
                }
                return wireIsConnectedToPin;
            });
        });
        if (panel) {
            return {
                panel,
                position,
                color: wire.color,
            };
        }
        return null;
    }
    getConnections() {
        return wires
            .map(wire => this.getConnectionForWire(wire))
            .filter(connection => connection !== null);
    }
}
exports.PanelController = PanelController;
//# sourceMappingURL=PanelController.js.map