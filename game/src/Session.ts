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
  public onFire: Phaser.Signal;
  public onMove: Phaser.Signal;
  public onHealthChanged: Phaser.Signal;
  public onScoreChanged: Phaser.Signal;
  public onSubsystemsChanged: Phaser.Signal;
  public onCardsChanged: Phaser.Signal;
  public onStateChanged: Phaser.Signal;

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

  private _state: GameState;

  constructor(private server: GameServer) {
    this.onScoreChanged = new Phaser.Signal();
    this.onHealthChanged = new Phaser.Signal();
    this.onSubsystemsChanged = new Phaser.Signal();
    this.onCardsChanged = new Phaser.Signal();
    this.onStateChanged = new Phaser.Signal();
    this.onFire = new Phaser.Signal();
    this.onMove = new Phaser.Signal();
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
    this.onSubsystemsChanged.dispatch();
  }

  get score(): number {
    return this._score;
  }

  set score(score) {
    this._score = score;
    this.onScoreChanged.dispatch();
  }

  get health(): number {
    return this._health;
  }

  set health(health) {
    this._health = Math.min(this.maxHealth, health);
    this.onHealthChanged.dispatch();
  }

  get state(): GameState {
    return this._state;
  }

  set state(state: GameState) {
    this.onStateChanged.dispatch(state);
    this.server.notifyGameState(state);
    this._state = state;
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
      this.onMove.dispatch(thrusterDirection);
    } else if (packet.kind === 'fire') {
      // ignore button-down events, only care about button-up events
      if (packet.state !== 'released') {
        return;
      }
      this.onFire.dispatch();
    } else if (packet.kind === 'scan') {
      const existingCard = this.cards.find(cardID => cardID === packet.cardID);
      if (!existingCard) {
        this.cards.push(packet.cardID);
      }
      this.onCardsChanged.dispatch(packet.cardID);
    }
    // else if (packet.kind === 'cheat') {
    //   if (packet.cheat.code === 'force_state') {
    //     this.session.state = packet.cheat.state;
    //   } else if (packet.cheat.code === 'set_volume') {
    //     this.setVolume(packet.cheat.volume / 100);
    //   }
    // }
  }
}
