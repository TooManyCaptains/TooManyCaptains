import React from 'react';
// Using an ES6 transpiler like Babel
// @ts-ignore
import Slider from 'react-rangeslider';

import 'react-rangeslider/lib/index.css';

// To include the default styles
import { CheatPacket, Packet } from '../../common/types';
import { Cheat } from '../../common/cheats';

import './cheats.css';
import { throttle, round } from 'lodash';

interface CheatsProps {
  socket: SocketIOClient.Socket;
}

type VolumeTarget = 'music' | 'master';

interface VolumeSliderProps {
  onChange: (volume: number) => void;
  target: VolumeTarget;
  socket: SocketIOClient.Socket;
}

interface VolumeSliderState {
  value: number;
}

class VolumeSlider extends React.Component<
  VolumeSliderProps,
  VolumeSliderState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: 1,
    };
  }

  public componentDidMount() {
    this.props.socket.on('packet', this.onPacket.bind(this));
  }

  public render() {
    return (
      <div className="VolumeSlider">
        <div className="VolumeTarget">{this.props.target}</div>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={this.state.value}
          tooltip={false}
          onChange={this.onChange.bind(this)}
        />
        <div className="VolumeValue">{`${round(
          this.state.value * 100,
          0,
        )}%`}</div>
      </div>
    );
  }

  private onPacket(packet: Packet) {
    if (packet.kind === 'cheat' && packet.cheat.code === 'set_volume') {
      if (packet.cheat.target === this.props.target) {
        this.setState({ value: packet.cheat.volume });
      }
    }
  }

  private onChange(rawFloat: number) {
    const value = round(rawFloat, 2);
    this.props.onChange(value);
    this.setState({ value });
  }
}

export default class Cheats extends React.Component<CheatsProps, {}> {
  public render() {
    const volumeTargets: VolumeTarget[] = ['master', 'music'];
    return (
      <div className="Cheats">
        <div className="VolumeControls">
          <div className="VolumeLabel">🔊Volume</div>
          {volumeTargets.map(target => (
            <VolumeSlider
              target={target}
              socket={this.props.socket}
              onChange={throttle(
                (volume: number) =>
                  this.sendCheat({ code: 'set_volume', target, volume }),
                100,
              )}
            />
          ))}
        </div>
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
