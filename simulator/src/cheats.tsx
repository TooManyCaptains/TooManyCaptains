import React from 'react';
// Using an ES6 transpiler like Babel
// @ts-ignore
import Slider from 'react-rangeslider';

import 'react-rangeslider/lib/index.css';

// To include the default styles
import { CheatPacket } from '../../common/types';
import { Cheat } from '../../common/cheats';

import './cheats.css';

interface CheatsProps {
  socket: SocketIOClient.Socket;
}

interface VolumeCheatProps {
  onChange: (volume: number) => void;
  title: string;
}

interface VolumeCheatState {
  value: number;
}

class VolumeCheat extends React.Component<VolumeCheatProps, VolumeCheatState> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: 1,
    };
  }

  public render() {
    const { value } = this.state;
    return (
      <div className="VolumeCheat">
        <div className="VolumeLabel">🔊 {this.props.title}</div>
        <div className="VolumeSlider">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={value}
            tooltip={false}
            onChange={(newValue: number) => {
              this.props.onChange(newValue);
              this.setState({
                value: newValue,
              });
            }}
          />
          <div className="VolumeValue">{`${(value * 100).toFixed(0)}%`}</div>
        </div>
      </div>
    );
  }
}

export default class Cheats extends React.Component<CheatsProps, {}> {
  public render() {
    return (
      <div className="Cheats">
        <VolumeCheat
          title="Music"
          onChange={volume =>
            this.sendCheat({ code: 'set_volume', target: 'music', volume })
          }
        />
        <VolumeCheat
          title="Master"
          onChange={volume =>
            this.sendCheat({ code: 'set_volume', target: 'master', volume })
          }
        />
        <div
          className="Cheat"
          onClick={() => this.sendCheat({ code: 'spawn_enemy' })}
        >
          👾 Spawn Enemy
        </div>
        <div
          className="Cheat"
          onClick={() => this.sendCheat({ code: 'spawn_asteroid' })}
        >
          💥️ Spawn Asteroid
        </div>
        <div
          className="Cheat KillPlayer"
          onClick={() => this.sendCheat({ code: 'kill_player' })}
        >
          ☠️ Kill Player
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
