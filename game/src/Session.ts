import {
  Color,
  ColorPosition,
  // Subsystem,
  GameState,
  CaptainCardID,
  EngineerCardID,
  WiringConfiguration,
  Packet,
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
  public captains: CaptainCardID[];
  public engineer: EngineerCardID | undefined;

  // Score
  public _score: number;

  // Health
  public readonly maxHealth = 100;
  private _health: number;

  private _state: GameState;

  constructor(private server: GameServer) {
    this.onScoreChanged = new Phaser.Signal();
    this.onHealthChanged = new Phaser.Signal();
    this.onSubsystemsChanged = new Phaser.Signal();
    this.onCardsChanged = new Phaser.Signal();
    this.onMove = new Phaser.Signal();
    this.onMove = new Phaser.Signal();
    this.reset();
    this.server.socket.on('packet', this.onPacket.bind(this));
  }

  public reset() {
    this.state = 'wait_for_players';
    this.thrusterDirection = ThrusterDirection.Stopped;
    this.repairLevel = RepairLevel.Off;
    this.thrusterLevel = ThrusterLevel.Off;
    this.shieldColors = [];
    this.engineer = undefined;
    this.captains = [];
    this.weaponColorPositions = [];
    this.score = 0;
    this.health = this.maxHealth;
    // this.wiringConfigurations = {
    //   weapons: [],
    //   thrusters: [],
    //   repairs: [],
    //   shields: [],
    // };
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
    this._health = health;
    this.onHealthChanged.dispatch();
  }

  get state(): GameState {
    return this._state;
  }

  set state(state: GameState) {
    this.server.notifyGameState(state);
    this._state = state;
  }

  private onPacket(packet: Packet) {
    if (packet.kind === 'wiring') {
      this.configurations = packet.configurations;
    } else if (packet.kind === 'move') {
      // if (packet.state === 'released') {
      //   // this.
      //   // this.game.session.thrusterDirection = ThrusterDirection.Stopped;
      // } else if (packet.direction === 'up') {
      //   // this.game.session.thrusterDirection = ThrusterDirection.Up;
      // } else if (packet.direction === 'down') {
      //   // this.game.session.thrusterDirection = ThrusterDirection.Down;
      // }
    } else if (packet.kind === 'fire') {
      this.onFire.dispatch();
      // if (packet.state === 'released') {
      //   this.player.fireWeapon();
      // }
    } else if (packet.kind === 'scan') {
      //   if (packet.kind === 'cheat') {
      //     if (packet.cheat.code === 'force_state') {
      //       this.session.state = packet.cheat.state;
      //     } else if (packet.cheat.code === 'set_volume') {
      //       this.setVolume(packet.cheat.volume / 100);
      //     }
      //   }
      // });
      // else if (packet.kind === 'fire') {
      //   if (packet.state === 'released') {
      //     if (captains.length >= 2) {
      //       this.state.start('Main');
      //     }
      //   }
      if (packet.cardID === 0) {
        this.engineer = packet.cardID;
      } else {
        const existingCaptain = this.captains.find(
          cardID => cardID === packet.cardID,
        );
        if (!existingCaptain) {
          this.captains.push(packet.cardID);
        }
        this.onCardsChanged.dispatch();
      }
    }
  }
}
