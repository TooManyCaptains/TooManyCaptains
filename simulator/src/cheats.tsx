import React from 'react';
import { CheatPacket } from '../../common/types';
import { Cheat } from '../../common/cheats';

import './cheats.css';

interface CheatsProps {
  socket: SocketIOClient.Socket;
}

export default class Cheats extends React.Component<CheatsProps, {}> {
  public render() {
    return (
      <div className="Cheats">
        <div
          className="Cheat"
          onClick={() => this.sendCheat({ code: 'kill_player' })}
        >
          ☠️ Kill Player
        </div>
        <div
          className="Cheat"
          onClick={() => this.sendCheat({ code: 'spawn_enemy' })}
        >
          👾 Spawn Enemy
        </div>
        <div
          className="Cheat"
          onClick={() => this.sendCheat({ code: 'fast_enemies' })}
        >
          🏃🏻‍♂️ Fast Enemies
        </div>
      </div>
    );
  }

  private sendCheat(cheat: Cheat) {
    const packet: CheatPacket = {
      kind: 'cheat',
      cheat,
    };
    this.props.socket.emit('packet', packet);
  }
}
