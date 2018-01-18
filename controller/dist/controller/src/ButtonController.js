"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpio = require("rpio");
const _ = require("lodash");
function isButtonPressed(button) {
    return rpio.read(button.pin) ? true : false;
}
class ButtonController {
    constructor(buttons, packetHandler, getGameState) {
        this.pollRateMsec = 50;
        this.prevPresses = [];
        this.sendPacket = packetHandler;
        this.buttons = buttons;
        this.setup();
        // Get initial pressed (before code started)
        this.prevPresses = this.getPresses();
        // Begin polling for button connections
        setInterval(this.poll.bind(this), this.pollRateMsec);
    }
    setup() {
        // Set up button pins for reading
        this.buttons.forEach(({ pin }) => {
            rpio.open(pin, rpio.INPUT, rpio.PULL_DOWN);
        });
    }
    poll() {
        const presses = this.getPresses();
        const newPresses = _.differenceWith(presses, this.prevPresses, _.isEqual);
        // If there were no new presses, just return early
        if (_.isEmpty(newPresses)) {
            return;
        }
        const packets = newPresses.map(buttonPress => {
            if (buttonPress.button.name === 'fire') {
                return {
                    kind: 'fire',
                    state: buttonPress.state,
                };
            }
            else {
                return {
                    kind: 'move',
                    state: buttonPress.state,
                    direction: buttonPress.button.name,
                };
            }
        });
        // dispatch packets
        packets.forEach(packet => this.sendPacket(packet));
        this.prevPresses = presses;
    }
    getPresses() {
        return this.buttons.map(button => {
            const isPressed = isButtonPressed(button);
            return {
                button,
                state: (isPressed ? 'pressed' : 'released'),
            };
        });
    }
}
exports.ButtonController = ButtonController;
//# sourceMappingURL=ButtonController.js.map