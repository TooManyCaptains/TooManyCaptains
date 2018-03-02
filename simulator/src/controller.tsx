import React from 'react';
import { Bay } from './bay';
import { Wire } from './types';
import {
  Packet,
  ColorPosition,
  Subsystem,
  ButtonState,
  Color,
} from '../../common/types';
import './controller.css';

const colors: Color[] = ['blue', 'red', 'yellow'];

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
      wires: colors.map(i => ({ color: i, inUse: false } as Wire)),
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
    colorPositions: ColorPosition[],
  ) {
    this.sendPacket({
      kind: 'wiring',
      configurations: [{ subsystem, colorPositions }],
    });
  }
}
