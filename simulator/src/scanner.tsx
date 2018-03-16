import React from 'react';
import { Packet, CardID } from '../../common/types';
import './scanner.css';
import { range } from 'lodash';

interface ScannerProps {
  socket: SocketIOClient.Socket;
}

export default class Scanner extends React.Component<ScannerProps, {}> {
  public onCardReaderScanned(cardID: CardID) {
    this.sendPacket({
      kind: 'scan',
      cardID,
    });
  }

  public render() {
    return (
      <div className="Scanner">
        <div className="CaptainSelector">
          {range(7).map(i => (
            <div
              className="Captain"
              onClick={() => this.onCardReaderScanned(i as CardID)}
            >{`${i === 0 ? 'Engineer' : 'Captain ' + i}`}</div>
          ))}
        </div>
      </div>
    );
  }

  private sendPacket(packet: Packet) {
    this.props.socket.emit('packet', packet);
  }
}
