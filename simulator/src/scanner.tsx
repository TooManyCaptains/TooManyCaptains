import React from 'react';
import { Subsystem, Packet, Captain } from '../../common/types';
import './scanner.css';
import { range } from 'lodash';

interface CardReaderProps {
  subsystem: Subsystem;
  onScan: (s: Subsystem) => void;
}

class CardReader extends React.Component<CardReaderProps, {}> {
  public render() {
    return (
      <div className="CardReader" onClick={this.onScan.bind(this)}>
        <img src={`/images/scanner-${this.props.subsystem}.png`} />
      </div>
    );
  }

  private onScan() {
    this.props.onScan(this.props.subsystem);
  }
}

interface ScannerProps {
  socket: SocketIOClient.Socket;
}

interface ScannerState {
  captain: Captain;
}

export default class Scanner extends React.Component<
  ScannerProps,
  ScannerState
> {
  public state = {
    captain: 1 as Captain,
  };

  public onCardReaderScanned(subsystem: Subsystem) {
    this.sendPacket({
      kind: 'scan',
      subsystem,
      captain: this.state.captain,
    });
  }

  public render() {
    return (
      <div className="Scanner">
        <div className="CaptainSelector">
          {range(1, 7).map(i => (
            <div
              className={`Captain Captain-${
                i === this.state.captain ? 'active' : ''
              }`}
              onClick={() => this.setCaptain(i as Captain)}
            >{`#${i}`}</div>
          ))}
        </div>
        <div className="Readers">
          <CardReader
            subsystem="weapons"
            onScan={this.onCardReaderScanned.bind(this)}
          />
          <CardReader
            subsystem="shields"
            onScan={this.onCardReaderScanned.bind(this)}
          />
          <CardReader
            subsystem="thrusters"
            onScan={this.onCardReaderScanned.bind(this)}
          />
          <CardReader
            subsystem="repairs"
            onScan={this.onCardReaderScanned.bind(this)}
          />
        </div>
      </div>
    );
  }

  private setCaptain(captain: Captain) {
    this.setState({ captain });
  }

  private sendPacket(packet: Packet) {
    this.props.socket.emit('packet', packet);
  }
}
