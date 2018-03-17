import io from 'socket.io-client';
import {
  Color,
  ColorPosition,
  GameState,
  WiringConfiguration,
  Packet,
  CardID,
  DebugFlags,
} from '../../common/types';
import { sortBy } from 'lodash';
import { seconds, minutes } from './utils';

export interface Wave {
  startTime: number;
  name: number | 'boss';
  enemies?: number;
  soundtrack: string;
}

const WAVES: Wave[] = [
  {
    startTime: seconds(10),
    name: 2,
    enemies: 3,
    soundtrack: 'music_stage_1',
  },
  {
    startTime: minutes(1.7),
    name: 3,
    enemies: 10,
    soundtrack: 'music_stage_2',
  },
  {
    startTime: minutes(3.5),
    name: 4,
    enemies: 15,
    soundtrack: 'music_stage_3',
  },
  {
    startTime: minutes(5.4),
    name: 'boss',
    soundtrack: 'music_stage_4',
  },
];

export enum RepairLevel {
  Off = 0,
  Low,
  Medium,
  High,
}

export enum ThrusterLevel {
  Off = 0,
  Slow,
  Fast,
}

export enum ThrusterDirection {
  Up = 'up',
  Down = 'down',
  Stopped = 'stopped',
}

export default class Session {
  // Game server
  public isConnected = false;

  // Signals
  public signals = {
    score: new Phaser.Signal(),
    health: new Phaser.Signal(),
    subsystems: new Phaser.Signal(),
    cards: new Phaser.Signal(),
    state: new Phaser.Signal(),
    fire: new Phaser.Signal(),
    move: new Phaser.Signal(),
    cheat: new Phaser.Signal(),
    wave: new Phaser.Signal(),
    volume: new Phaser.Signal(),
    serverConnection: new Phaser.Signal(),
    debugFlagsChanged: new Phaser.Signal(),
  };

  // Weapons
  public weaponColorPositions: ColorPosition[];

  // Shields
  public shieldColors: Color[];

  // Repairs
  public repairLevel: RepairLevel;

  // Thrusters
  public thrusterLevel: ThrusterLevel;

  // Cards
  public cards: CardID[];

  // Score
  public _score: number;

  // Health
  public maxHealth = 100;
  private _health: number;

  // Game state
  private _state: GameState;

  // Waves and timers
  private _wave: Wave;
  private _waveTimers: number[] = [];

  // Volume
  private _masterVolume = 1;
  private _musicVolume = 1;

  private _debugFlags: DebugFlags;

  // Game server
  private socket: SocketIOClient.Socket;

  constructor(URL: string) {
    this.socket = io(URL);
    this.socket.on('packet', this.onPacket.bind(this));
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.signals.serverConnection.dispatch(this.isConnected);
    });
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.signals.serverConnection.dispatch(this.isConnected);
    });
    this.reset();
  }

  public reset() {
    this.state = 'wait_for_players';
    this.repairLevel = RepairLevel.Off;
    this.thrusterLevel = ThrusterLevel.Off;
    this.shieldColors = [];
    this.cards = [];
    this.weaponColorPositions = [];
    this.score = 0;
    this.wave = WAVES[0];
    this._waveTimers = [];
    this.health = this.maxHealth;
  }

  set configurations(configurations: WiringConfiguration[]) {
    configurations.map(({ subsystem, colorPositions }) => {
      if (subsystem === 'weapons') {
        this.weaponColorPositions = colorPositions;
      } else if (subsystem === 'shields') {
        // Positions don't matter for shields
        this.shieldColors = sortBy(colorPositions, 'color').map(cp => cp.color);
      } else if (subsystem === 'thrusters') {
        this.thrusterLevel = colorPositions.length;
      } else if (subsystem === 'repairs') {
        this.repairLevel = colorPositions.length;
      }
    });
    this.signals.subsystems.dispatch();
  }

  get debugFlags() {
    return this._debugFlags;
  }

  get volume() {
    return {
      music: this._musicVolume,
      master: this._masterVolume,
    };
  }

  get score(): number {
    return this._score;
  }

  set score(score) {
    this._score = score;
    this.signals.score.dispatch();
  }

  get totalTimeToBoss() {
    return WAVES.find(({ name }) => name === 'boss')!.startTime;
  }

  get wave() {
    return this._wave;
  }

  set wave(wave: Wave) {
    this._wave = wave;
    this.signals.wave.dispatch(this.wave);
  }

  get health(): number {
    return this._health;
  }

  set health(health) {
    this._health = Math.min(this.maxHealth, health);
    this.signals.health.dispatch();
  }

  get state(): GameState {
    return this._state;
  }

  set state(state: GameState) {
    this.signals.state.dispatch(state);
    if (state === 'in_game') {
      this.setWaveTimers();
    }
    this.notifyGameState(state);
    this._state = state;
  }

  private setWaveTimers() {
    WAVES.forEach(wave => {
      const timer = setTimeout(() => (this.wave = wave), wave.startTime);
      this._waveTimers.push(timer);
    });
  }

  private onPacket(packet: Packet) {
    console.log(packet);
    if (packet.kind === 'wiring') {
      this.configurations = packet.configurations;
    } else if (packet.kind === 'move') {
      const thrusterDirection = (() => {
        if (packet.state === 'released') {
          return ThrusterDirection.Stopped;
        }
        if (packet.direction === 'up') {
          return ThrusterDirection.Up;
        }
        return ThrusterDirection.Down;
      })();
      this.signals.move.dispatch(thrusterDirection);
    } else if (packet.kind === 'fire') {
      // ignore button-down events, only care about button-up events
      if (packet.state !== 'released') {
        return;
      }
      this.signals.fire.dispatch(packet.state);
    } else if (packet.kind === 'scan') {
      const existingCard = this.cards.find(cardID => cardID === packet.cardID);
      if (!existingCard) {
        this.cards.push(packet.cardID);
      }
      this.signals.cards.dispatch(packet.cardID);
    } else if (packet.kind === 'cheat') {
      this.signals.cheat.dispatch(packet.cheat);
      if (packet.cheat.code === 'set_volume') {
        if (packet.cheat.target === 'master') {
          this._masterVolume = packet.cheat.volume;
        } else {
          this._musicVolume = packet.cheat.volume;
        }
        this.signals.volume.dispatch(this.volume);
      } else if (packet.cheat.code === 'set_debug_flags') {
        this._debugFlags = packet.cheat.flags;
        if (this.debugFlags.invuln) {
          this.maxHealth = 10_000;
          this.health = 10_000;
        } else {
          this.maxHealth = 100;
          this.health = 100;
        }
        this.signals.debugFlagsChanged.dispatch(this.debugFlags);
      }
    }
  }

  private notifyGameState(state: GameState) {
    const packet: Packet = {
      kind: 'gamestate',
      state,
    };
    this.socket.emit('packet', packet);
  }
}
