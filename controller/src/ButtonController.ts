import * as rpio from 'rpio';
import * as _ from 'lodash';
import { Button, Press } from './types';
import {
  MovePacket,
  FirePacket,
  Packet,
  GameState,
  ButtonState,
} from '../../common/types';

function isButtonPressed(button: Button): boolean {
  return rpio.read(button.pin) === 0;
}

export class ButtonController {
  public readonly pollRateMsec: number = 50;
  public readonly buttons: Button[];
  public readonly sendPacket: (packet: Packet) => void;
  private prevPresses: Press[] = [];

  constructor(
    buttons: Button[],
    packetHandler: (packet: Packet) => void,
    getGameState: () => GameState,
  ) {
    this.sendPacket = packetHandler;
    this.buttons = buttons;
    this.setup();

    // Get initial pressed (before code started)
    this.prevPresses = this.getPresses();
    // Begin polling for button connections
    setInterval(this.poll.bind(this), this.pollRateMsec);
  }

  private setup(): void {
    // Set up button pins for reading
    this.buttons.forEach(({ pin }) => {
      rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
    });
  }

  private poll(): void {
    const presses = this.getPresses();
    const newPresses: Press[] = _.differenceWith(
      presses,
      this.prevPresses,
      _.isEqual,
    );

    // If there were no new presses, just return early
    if (_.isEmpty(newPresses)) {
      return;
    }

    const packets = newPresses.map(buttonPress => {
      if (buttonPress.button.name === 'fire') {
        const packet: FirePacket = {
          kind: 'fire',
          state: buttonPress.state,
        };
        return packet;
      } else {
        const packet: MovePacket = {
          kind: 'move',
          state: buttonPress.state,
          direction: buttonPress.button.name,
        };
        return packet;
      }
    });

    // dispatch packets
    packets.forEach(packet => this.sendPacket(packet));

    this.prevPresses = presses;
  }

  private getPresses(): Press[] {
    return this.buttons.map(button => {
      const isPressed = isButtonPressed(button);
      return {
        button,
        state: (isPressed ? 'pressed' : 'released') as ButtonState,
      };
    });
  }
}
