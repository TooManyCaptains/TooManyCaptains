import * as _ from 'lodash';
import * as rpio from 'rpio';
import { Wire, Panel, Connection } from './types';
import { GameState, Packet, WiringPacket } from '../../common/types';

const wires: Wire[] = [
  {
    color: 'blue',
    pin: 19,
  },
  {
    color: 'red',
    pin: 21,
  },
  {
    color: 'yellow',
    pin: 23,
  },
];

type PacketHandler = (packet: Packet) => void;

export class PanelController {
  public readonly pollRateMsec: number = 250;
  public readonly panels: Panel[] = [];
  public readonly sendPacket: PacketHandler;
  private connections: Connection[] = [];
  private getGameState: () => GameState;

  constructor(
    panels: Panel[],
    packetHandler: PacketHandler,
    getGameState: () => GameState,
  ) {
    this.getGameState = getGameState;
    this.sendPacket = packetHandler;
    this.panels = panels;
    this.setup();

    // Begin polling for wire connections
    setInterval(this.poll.bind(this), this.pollRateMsec);
  }

  public resetConnections() {
    console.log('resetting connections');
    this.connections = [];
    this.poll();
  }

  private setup(): void {
    // Set up wire pins for writing
    wires.forEach(({ pin }) => {
      rpio.open(pin, rpio.OUTPUT, rpio.LOW);
      rpio.pud(pin, rpio.PULL_DOWN);
    });

    // Set up button light pins for writing
    this.panels.forEach(({ buttonLightPin }) => {
      if (buttonLightPin) {
        rpio.open(buttonLightPin, rpio.OUTPUT, rpio.LOW);
        rpio.pud(buttonLightPin, rpio.PULL_DOWN);
      }
    });

    // Set up all panel wire pins for reading
    _.flatten(_.map(this.panels, 'pins')).forEach(pin => {
      rpio.open(pin, rpio.INPUT);
      rpio.pud(pin, rpio.PULL_DOWN);
    });
  }

  private poll() {
    const newConnections = this.getConnections();
    // console.log(newConnections);

    // If there were no new/changed connections, just return early
    if (_.isEqual(newConnections, this.connections)) {
      return;
    }

    // console.log(_.difference(newConnections, this.connections));

    // Update panels
    this.panels.forEach(panel => {
      panel.connections = newConnections.filter(
        conn => conn.panel.subsystem === panel.subsystem,
      );
      panel.update(this.getGameState());
    });

    // Send
    this.sendConnections();

    this.connections = newConnections;
  }

  private sendConnections() {
    const configurations = this.panels.map(panel => ({
      subsystem: panel.subsystem,
      colorPositions: panel.connections.map(({ color, position }) => ({
        color,
        position,
      })),
    }));
    const packet: WiringPacket = {
      kind: 'wiring',
      configurations,
    };
    this.sendPacket(packet);
  }

  private getConnectionForWire(wire: Wire): Connection | null {
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

  private getConnections(): Connection[] {
    return wires
      .map(wire => this.getConnectionForWire(wire))
      .filter(connection => connection !== null) as Connection[];
  }
}
