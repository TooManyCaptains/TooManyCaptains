import React from 'react';
import { Subsystem, Packet, CardID } from '../../common/types';
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
  cardID: CardID;
}

export default class Scanner extends React.Component<
  ScannerProps,
  ScannerState
> {
  public state = {
    cardID: 1 as CardID,
  };

  public onCardReaderScanned(subsystem: Subsystem) {
    this.sendPacket({
      kind: 'scan',
      subsystem,
      cardID: this.state.cardID,
    });
  }

  public render() {
    return (
      <div className="Scanner">
        <div className="CaptainSelector">
          {range(7).map(i => (
            <div
              className={`Captain Captain-${
                i === this.state.cardID ? 'active' : ''
              }`}
              onClick={() => this.setCardID(i as CardID)}
            >{`#${i}`}</div>
          ))}
        </div>
        <div className="Readers">
          <CardReader
            subsystem="weapons"
            onScan={this.onCardReaderScanned.bind(this)}
          />
        </div>
      </div>
    );
  }

  private setCardID(cardID: CardID) {
    this.setState({ cardID });
  }

  private sendPacket(packet: Packet) {
    this.props.socket.emit('packet', packet);
  }
}
