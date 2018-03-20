import io from 'socket.io-client';
import {
  Color,
  ColorPosition,
  GameState,
  WiringConfiguration,
  Packet,
  CardID,
  DebugFlags,
  ScorePacket,
  CaptainCardID,
} from '../../common/types';
import { sortBy } from 'lodash';

export const LOW_HEALTH = 35;
export const VERY_LOW_HEALTH = 15;

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
  public thrusterDirection: ThrusterDirection;

  // Cards
  public cards: Set<CardID>;

  // Score
  public _score: number;

  // Health
  public maxHealth = 100;
  private _health: number;

  // Game state
  private _state: GameState;

  // Database-related (readonly)
  private _masterVolume = 1;
  private _musicVolume = 1;
  private _highScore = 0;

  // Debug flags
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
    this.state = 'wait_for_cards';
    this.repairLevel = RepairLevel.Off;
    this.thrusterLevel = ThrusterLevel.Off;
    this.shieldColors = [];
    // this.cards = new Set([0, 1, 2, 3, 5, 6, 4] as CardID[]);
    this.cards = new Set();
    this.weaponColorPositions = [];
    this.score = 0;
    this.health = this.maxHealth;
    this.thrusterDirection = ThrusterDirection.Stopped;
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

  get canStartRound(): boolean {
    return this.captainsInRound.size >= 2 && this.cards.has(0);
  }

  get captainsInRound() {
    const justCaptains = new Set(this.cards);
    if (justCaptains.has(0)) {
      justCaptains.delete(0);
    }
    return justCaptains as Set<CaptainCardID>;
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

  get highScore() {
    return this._highScore;
  }

  get score(): number {
    return this._score;
  }

  set score(score) {
    this._score = score;
    this.signals.score.dispatch();
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
    this.notifyGameState(state);
    this._state = state;
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
      this.thrusterDirection = thrusterDirection;
      this.signals.move.dispatch(thrusterDirection);
    } else if (packet.kind === 'fire') {
      // ignore button-down events, only care about button-up events
      if (packet.state !== 'released') {
        return;
      }
      this.signals.fire.dispatch(packet.state);
    } else if (packet.kind === 'scan') {
      this.signals.cards.dispatch(packet.cardID);
    } else if (packet.kind === 'score') {
      if (packet.confirmedHighScore) {
        this._highScore = packet.points;
      }
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

  private notifyScore() {
    const packet: ScorePacket = {
      kind: 'score',
      points: this.score,
      confirmedHighScore: false,
    };
    this.socket.emit('packet', packet);
  }

  private notifyGameState(state: GameState) {
    const packet: Packet = {
      kind: 'gamestate',
      state,
    };
    if (state === 'game_over') {
      this.notifyScore();
    }
    this.socket.emit('packet', packet);
  }
}
