import * as _ from 'lodash';
import * as rpio from 'rpio';
import {
  WirePin,
  WireColor,
  Wire,
  Panel,
  ColorPosition,
  Connection,
} from './types';
import { GameState, Packet } from '../../common/types';

const wires: Wire = {
  red: 3,
  blue: 5,
  yellow: 7,
};

type PacketHandler = (packet: Packet) => void;

export class PanelController {
  public readonly pollRateMsec: number = 250;
  public readonly panels: Panel[] = [];
  public readonly sendPacket: PacketHandler;
  private prevConnections: Connection[] = [];
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

  public emitAll() {
    const connections = this.getConnections();
    connections.forEach(({ color, panel }) => {
      if (panel === null) {
        return;
      }
      const colorPositions = this.colorPositions(connections, panel);
      const packet = this.packetForPanelWithColorPositions(
        panel,
        colorPositions,
      );
      panel!.update(colorPositions, this.getGameState());
      this.sendPacket(packet);
    });
  }

  private setup(): void {
    // Set up wire pins for writing
    Object.values(wires).forEach(pin => {
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

  // Returns the colors of the wires plugged into panel
  private colorPositions(
    connections: Connection[],
    panel: Panel | null,
  ): ColorPosition[] {
    return _.sortBy(connections, 'position')
      .filter(conn => conn.panel && panel && conn.panel.name === panel.name)
      .map(({ color, position }) => ({ color, position }));
  }

  private poll() {
    const connections = this.getConnections();
    const newConnections = _.differenceWith(
      connections,
      this.prevConnections,
      _.isEqual,
    );

    // If there were no new connections, just return early
    if (_.isEmpty(newConnections)) {
      return;
    }

    // Dispatch server packets and change lights based on new connections
    newConnections.forEach(c => this.processConnection(c, connections));
    this.prevConnections = connections;
  }

  private processConnection(connection: Connection, connections: Connection[]) {
    const { color, panel } = connection;
    let panelToUse: Panel;
    if (panel) {
      // Connection added, use the panel it was added to
      panelToUse = panel;
    } else {
      // Connection removed, find the panel it was previously connected to and remove it
      const previousConnection = this.prevConnections.find(
        (conn: Connection) => conn.color === color,
      );
      // If the previous connection doesn't exist, it's because
      // it was plugged in before the daemon was started. That's fine,
      // just skip it!
      if (!previousConnection) {
        return;
      }
      panelToUse = previousConnection.panel!;
    }
    const colorPositions = this.colorPositions(connections, panelToUse);
    const packet = this.packetForPanelWithColorPositions(
      panelToUse,
      colorPositions,
    );
    panelToUse.update(colorPositions, this.getGameState());
    this.sendPacket(packet);
  }

  // Create an event based on the panel and wires
  private packetForPanelWithColorPositions(
    panel: Panel,
    colorPositions: ColorPosition[],
  ): Packet {
    return {
      kind: 'wiring',
      subsystem: panel.name,
      wires: _.sortBy(colorPositions, 'position').map(p => p.color),
    };
  }

  private whereIsWirePluggedIn(
    pin: WirePin,
  ): { position: number | null; panel: Panel | null } {
    // Set all wire pins to LOW
    Object.values(wires).forEach(w => rpio.write(w, rpio.LOW));
    // Set the we're testing in to HIGH
    rpio.write(pin, rpio.HIGH);
    // Find the panel that the wire is plugged in and what position it is in (i.e. order)
    let position = null;
    const panel =
      _.find(this.panels, ({ name, pins }) => {
        return pins.some((p, i) => {
          const wireIsConnectedToPin = Boolean(rpio.read(p));
          if (wireIsConnectedToPin) {
            position = i;
          }
          return wireIsConnectedToPin;
        });
      }) || null;
    return { panel, position };
  }

  private getConnections(): Connection[] {
    return _.map(wires, (pin: WirePin, color: WireColor) => {
      const { panel, position } = this.whereIsWirePluggedIn(pin);
      return { color, panel, position };
    });
  }
}
