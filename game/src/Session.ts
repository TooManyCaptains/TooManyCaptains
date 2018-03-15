import {
  Color,
  ColorPosition,
  GameState,
  WiringConfiguration,
  Packet,
  CardID,
} from '../../common/types';
import GameServer from './GameServer';
import { sortBy } from 'lodash';

const minutes = (millis: number) => millis * 60_000;

export interface Wave {
  startTime: number;
  name: number | 'boss';
  enemies?: number;
  soundtrack: string;
}

const WAVES: Wave[] = [
  {
    startTime: minutes(0.5),
    name: 2,
    enemies: 5,
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
  // private _timeRoundStarted: number;

  constructor(private server: GameServer) {
    this.reset();
    this.server.socket.on('packet', this.onPacket.bind(this));
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
    this.server.notifyGameState(state);
    this._state = state;
  }

  private setWaveTimers() {
    WAVES.forEach(wave => {
      const timer = setTimeout(() => (this.wave = wave), wave.startTime);
      this._waveTimers.push(timer);
    });
  }

  private onPacket(packet: Packet) {
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
      //   } else if (packet.cheat.code === 'set_volume') {
      //     this.setVolume(packet.cheat.volume / 100);
      //   }
    }
  }
}
