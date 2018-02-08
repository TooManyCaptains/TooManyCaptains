import React from 'react';
import { Bay } from './bay';
import { Wire, wireName } from './types';
import { Packet, Color, Subsystem, ButtonState } from '../../common/types';
import { range } from 'lodash';
import './controller.css';

const NUM_WIRES = 3;

interface ControllerState {
  wires: Wire[];
  isLoading: boolean;
  overHeatTimer: number | null;
  shieldTimer: number | null;
}

interface ControllerProps {
  socket: SocketIOClient.Socket;
}

export default class Controller extends React.Component<
  ControllerProps,
  ControllerState
> {
  constructor(props: ControllerProps) {
    super(props);
    this.state = {
      wires: range(NUM_WIRES).map(i => ({ color: i, inUse: false } as Wire)),
      isLoading: true,
      shieldTimer: null,
      overHeatTimer: null,
    };
  }

  public render() {
    return (
      <div className="Controller">
        <Bay
          name="weapons"
          numPorts={3}
          wires={this.state.wires}
          onNewConfiguration={config =>
            this.onSubsystemWiringChanged('weapons', config)
          }
          onWireAdded={this.onWireAdded.bind(this)}
          onWireRemoved={this.onWireRemoved.bind(this)}
        >
          <div
            className="FireButton"
            onTouchStart={() => this.fireButton('pressed')}
            onTouchEnd={() => this.fireButton('released')}
            onMouseDown={() => this.fireButton('pressed')}
            onMouseUp={() => this.fireButton('released')}
          />
        </Bay>
        <Bay
          name="shields"
          numPorts={3}
          wires={this.state.wires}
          onNewConfiguration={config =>
            this.onSubsystemWiringChanged('shields', config)
          }
          onWireAdded={this.onWireAdded.bind(this)}
          onWireRemoved={this.onWireRemoved.bind(this)}
        />
        <Bay
          name="thrusters"
          numPorts={2}
          wires={this.state.wires}
          onNewConfiguration={config =>
            this.onSubsystemWiringChanged('thrusters', config)
          }
          onWireAdded={this.onWireAdded.bind(this)}
          onWireRemoved={this.onWireRemoved.bind(this)}
        >
          <div className="Propulsion-controls">
            <div
              className="Move"
              onTouchStart={() => this.setMovement('up')}
              onTouchEnd={() => this.setMovement('stop')}
              onMouseDown={() => this.setMovement('up')}
              onMouseUp={() => this.setMovement('stop')}
            >
              ⬆
            </div>
            <div
              className="Move"
              onTouchStart={() => this.setMovement('down')}
              onTouchEnd={() => this.setMovement('stop')}
              onMouseDown={() => this.setMovement('down')}
              onMouseUp={() => this.setMovement('stop')}
            >
              ⬇
            </div>
          </div>
        </Bay>
        <Bay
          name="repairs"
          numPorts={3}
          wires={this.state.wires}
          onNewConfiguration={config =>
            this.onSubsystemWiringChanged('repairs', config)
          }
          onWireAdded={this.onWireAdded.bind(this)}
          onWireRemoved={this.onWireRemoved.bind(this)}
        />
      </div>
    );
  }

  private sendPacket(packet: Packet) {
    this.props.socket.emit('packet', packet);
  }

  private fireButton(state: ButtonState) {
    this.sendPacket({
      kind: 'fire',
      state,
    });
  }

  private setMovement(direction: 'up' | 'down' | 'stop') {
    if (direction === 'up') {
      this.sendPacket({
        kind: 'move',
        direction: 'up',
        state: 'pressed',
      });
    } else if (direction === 'down') {
      this.sendPacket({
        kind: 'move',
        direction: 'down',
        state: 'pressed',
      });
    } else {
      this.sendPacket({
        kind: 'move',
        direction: 'up',
        state: 'released',
      });
      this.sendPacket({
        kind: 'move',
        direction: 'up',
        state: 'released',
      });
    }
  }

  private onWireAdded(wire: Wire) {
    const wires = this.state.wires.map(w => {
      if (w.color === wire.color) {
        w.inUse = true;
      }
      return w;
    });
    this.setState({ wires });
  }

  private onWireRemoved(wire: Wire) {
    const wires = this.state.wires.map(w => {
      if (w.color === wire.color) {
        w.inUse = false;
      }
      return w;
    });
    this.setState({ wires });
  }

  private onSubsystemWiringChanged(
    subsystem: Subsystem,
    wires: Array<Wire | null>,
  ) {
    const colors = wires
      .filter(wire => wire !== null)
      .map(wire => wireName(wire)) as Color[];
    this.sendPacket({
      kind: 'wiring',
      subsystem,
      wires: colors,
    });
  }
}
