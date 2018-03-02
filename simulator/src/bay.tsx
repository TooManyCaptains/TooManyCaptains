import * as _ from 'lodash';
import * as React from 'react';
import { Port, Wire, wireName } from './types';
import { Subsystem, ColorPosition } from '../../common/types';

interface PortComponentProps {
  port: Port;
  wires: Wire[];
  onWirePluggedIn: (port: Port, wire: Wire) => void;
  onWireUnplugged: (port: Port) => void;
}

// tslint:disable-next-line:variable-name
const PortComponent: React.SFC<PortComponentProps> = props => {
  function onWirePluggedIn(port: Port, wire: Wire) {
    // Make sure wire isn't already plugged in
    const isWireAlreadyPluggedIn = props.wires.some(
      w => w.color === wire.color && w.inUse,
    );
    if (isWireAlreadyPluggedIn) {
      return;
    }
    // Make sure the port doesn't already have a wire in it
    if (port.wire !== null) {
      return;
    }
    props.onWirePluggedIn(port, wire);
  }

  function onWireUnplugged(p: Port) {
    // Can't unplug a wire from a port that has nothing plugged in!
    if (p.wire === null) {
      return;
    }
    props.onWireUnplugged(p);
  }

  const portStatus = (() => {
    if (props.port.isDisabled && props.port.wire === null) {
      return 'recharging';
    }
    if (props.port.isDisabled) {
      return 'disabled';
    }
    if (props.port.wire === null) {
      return 'unplugged';
    } else {
      return 'used';
    }
  })();
  return (
    <div className={`Port Wire-${wireName(props.port.wire)}`}>
      <div className="Wire-icon-container">
        {props.wires.map(wire => (
          <div
            className={`Wire-${wireName(wire)} Wire-icon`}
            onClick={() => onWirePluggedIn(props.port, wire)}
          />
        ))}
        <div
          className="Wire-none Wire-icon"
          onClick={() => onWireUnplugged(props.port)}
        />
      </div>
      <div className={`Port-status Port-status-${portStatus}`} />
    </div>
  );
};

interface BayProps {
  name: Subsystem;
  numPorts: number;
  wires: Wire[];
  onNewConfiguration: (colorPositions: ColorPosition[]) => void;
  onWireAdded: (wire: Wire) => void;
  onWireRemoved: (wire: Wire) => void;
}

interface BayState {
  ports: Port[];
}

export class Bay extends React.Component<BayProps, BayState> {
  constructor(props: BayProps) {
    super(props);
    this.state = {
      ports: _.range(this.props.numPorts).map(
        i => ({ id: i, isDisabled: false, wire: null } as Port),
      ),
    };
  }

  public render() {
    return (
      <div className="Bay Weapon-Bay">
        <div className="Bay-name">{this.props.name}</div>
        <div className="Bay-panel">
          <div className="Bay-ports">
            {this.state.ports.map(port => (
              <PortComponent
                wires={this.props.wires}
                port={port}
                onWirePluggedIn={this.plugWireIntoPort.bind(this)}
                onWireUnplugged={this.unplugWireFromPort.bind(this)}
              />
            ))}
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }

  private plugWireIntoPort(port: Port, wire: Wire) {
    const ports = this.state.ports.map(p => {
      if (p.id === port.id && p.isDisabled === false) {
        p.wire = wire;
      }
      return p;
    });
    this.setState({ ports }, () => this.onNewConfiguration());
    this.props.onWireAdded(wire);
  }

  private onNewConfiguration() {
    const colorPositions = this.state.ports
      .map((port, i) => {
        if (port.isDisabled || port.wire === null) {
          return null;
        }
        return {
          color: port.wire.color,
          position: i,
        };
      })
      .filter(colorPosition => colorPosition !== null) as ColorPosition[];
    this.props.onNewConfiguration(colorPositions);
  }

  private unplugWireFromPort(port: Port) {
    this.props.onWireRemoved(port.wire!);
    const ports = this.state.ports.map(p => {
      if (p.id === port.id && p.isDisabled === false) {
        p.wire = null;
      }
      return p;
    });
    this.setState({ ports }, () => this.onNewConfiguration());
  }
}
