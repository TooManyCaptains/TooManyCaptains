import { has } from 'lodash';
import Stats from 'stats.js';
import Main from './states/Main';
import Boot from './states/Boot';
import Before from './states/Before';
import Preload from './states/Preload';
import After from './states/After';
import GameServer from './GameServer';
import {
  Packet,
  GameState,
  Subsystem,
  ColorPosition,
  CaptainCardID,
} from '../../common/types';
import PlayerShip from './entities/PlayerShip';
import { EnemyBulletPool } from './entities/EnemyWeapon';

import './index.css';
import NetworkedState from './states/NetworkedState';

function getUrlParams(search: string): { [P in string]: string } {
  const hashes = search.slice(search.indexOf('?') + 1).split('&');
  const params = {};
  hashes.forEach(hash => {
    const [key, val] = hash.split('=');
    console.log(key, val);
    params[key] = decodeURIComponent(val);
  });

  return params;
}

interface Config {
  debug: boolean;
  skip: boolean;
  invulnerable: boolean;
  local: boolean;
  serverURL: string;
}

function getConfig() {
  const urlParams = getUrlParams(window.location.search);

  const config: Config = {
    debug: has(urlParams, 'debug'),
    skip: has(urlParams, 'skip'),
    invulnerable: has(urlParams, 'invuln'),
    local: has(urlParams, 'local'),
    serverURL: 'http://server.toomanycaptains.com',
  };
  if (config.local) {
    config.serverURL = 'http://starship:9000';
  } else if (has(urlParams, 'serverURL')) {
    config.serverURL = urlParams.serverURL;
  }
  return config;
}

export class Game extends Phaser.Game {
  public params: Config;
  public server: GameServer;
  public captains: CaptainCardID[] = [];
  public score: number = 0;
  public player: PlayerShip;
  public wiringConfigurations: { [S in Subsystem]: ColorPosition[] } = {
    weapons: [],
    thrusters: [],
    repairs: [],
    shields: [],
  };

  public enemyBullets: EnemyBulletPool;

  private _gameState: GameState = 'wait_for_players';

  constructor() {
    super(1920, 1080, Phaser.CANVAS, 'surface');
    this.state.add('Boot', Boot, false);
    this.state.add('Preload', Preload, false);
    this.state.add('Before', Before, false);
    this.state.add('Main', Main, false);
    this.state.add('After', After, false);

    this.params = getConfig();
    console.log(this.params);

    // Kick things off with the boot state.
    this.state.start('Boot');
    this.bindServerEvents();

    if (this.params.debug) {
      this.setupPerformanceStatistics();
    }
  }

  public setVolume(volume?: number) {
    if (volume !== undefined) {
      localStorage.setItem('volume', String(volume));
      this.sound.volume = volume;
    } else {
      const previousVolume = localStorage.getItem('volume');
      if (previousVolume !== null) {
        this.setVolume(Number(previousVolume));
      }
    }
  }

  get gameState(): GameState {
    return this._gameState;
  }

  set gameState(gameState: GameState) {
    this._gameState = gameState;
    if (gameState === 'wait_for_players') {
      this.captains = [];
    }
    this.server.notifyGameState(gameState);
  }

  private bindServerEvents() {
    this.server = new GameServer(this.params.serverURL);

    this.server.socket.on('packet', (packet: Packet) => {
      console.log(packet);

      if (this.state.getCurrentState() instanceof NetworkedState) {
        (this.state.getCurrentState() as NetworkedState).onPacket(packet);
      }

      if (packet.kind === 'cheat') {
        if (packet.cheat.code === 'force_state') {
          this.gameState = packet.cheat.state;
        } else if (packet.cheat.code === 'set_volume') {
          this.setVolume(packet.cheat.volume / 100);
        }
      }
    });
  }

  private setupPerformanceStatistics() {
    // Setup the new stats panel.
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.update;
    this.update = (...args: any[]) => {
      stats.begin();
      updateLoop.apply(this, args);
      stats.end();
    };
  }
}

// tslint:disable-next-line:no-unused-expression
new Game();
