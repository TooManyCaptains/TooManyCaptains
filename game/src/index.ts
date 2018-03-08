import { has } from 'lodash';
import Stats from 'stats.js';
import Main from './states/Main';
import Boot from './states/Boot';
import Before from './states/Before';
import Preload from './states/Preload';
import After from './states/After';
import GameServer from './GameServer';
import { GameCaptain } from './types';
import {
  Packet,
  GameState,
  Subsystem,
  ColorPosition,
} from '../../common/types';
import PlayerShip from './entities/PlayerShip';
import { EnemyWeapon } from './entities/Weapon';

import './index.css';

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
  noCards: boolean;
}

function getConfig() {
  const urlParams = getUrlParams(window.location.search);

  const config: Config = {
    debug: has(urlParams, 'debug'),
    skip: has(urlParams, 'skip'),
    invulnerable: has(urlParams, 'invuln'),
    local: has(urlParams, 'local'),
    noCards: has(urlParams, 'nocards'),
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
  public captains: GameCaptain[] = [];
  public score: number = 0;
  public player: PlayerShip;
  public wiringConfigurations: { [S in Subsystem]: ColorPosition[] } = {
    weapons: [],
    thrusters: [],
    repairs: [],
    shields: [],
  };

  public enemyWeapons: EnemyWeapon;

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

  get gameState(): GameState {
    return this._gameState;
  }

  set gameState(gameState: GameState) {
    this._gameState = gameState;
    this.server.notifyGameState(gameState);
  }

  private bindServerEvents() {
    this.server = new GameServer(this.params.serverURL);
    const gameMainState = this.state.states.Main as Main;

    this.server.socket.on('packet', (packet: Packet) => {
      if (this.params.debug) {
        console.log(packet);
      }

      if (packet.kind === 'wiring' && this.state.current === 'Main') {
        packet.configurations.map(({ subsystem, colorPositions }) => {
          this.wiringConfigurations[subsystem] = colorPositions;
          if (subsystem === 'weapons') {
            gameMainState.onWeaponsConfiguration(colorPositions);
          } else if (subsystem === 'shields') {
            gameMainState.onShieldsConfiguration(colorPositions);
          } else if (subsystem === 'thrusters') {
            gameMainState.onThrustersConfiguration(colorPositions);
          } else if (subsystem === 'repairs') {
            gameMainState.onRepairsConfiguration(colorPositions);
          }
        });
      } else if (packet.kind === 'move' && this.state.current === 'Main') {
        if (packet.state === 'released') {
          gameMainState.onMoveStop();
        } else if (packet.direction === 'up') {
          gameMainState.onMoveUp();
        } else if (packet.direction === 'down') {
          gameMainState.onMoveDown();
        }
      } else if (packet.kind === 'fire') {
        if (this.state.current === 'Before' && packet.state === 'released') {
          if (this.captains.length >= 2) {
            this.state.start('Main');
          }
        } else if (
          this.state.current === 'After' &&
          packet.state === 'released'
        ) {
          this.state.start('Main');
        } else if (this.state.current === 'Main') {
          gameMainState.onFire(packet.state);
        }
      } else if (packet.kind === 'scan') {
        const captain = this.captains.find(c => c.cardID === packet.cardID);
        if (this.state.current === 'Before') {
          if (!captain && packet.cardID !== 0) {
            this.captains.push({
              cardID: packet.cardID,
              charge: 0,
            });
          } else {
            // TODO: add engineer
          }
        } else if (this.state.current === 'Main') {
          if (!captain) {
            throw Error('captain not in game!');
          }
          gameMainState.onCaptainScan(captain, packet.subsystem);
        }
      } else if (packet.kind === 'cheat') {
        const cheat = packet.cheat;
        if (cheat.code === 'kill_player') {
          this.player.kill();
        } else if (cheat.code === 'spawn_enemy') {
          gameMainState.board.spawnEnemy();
        } else if (cheat.code === 'spawn_asteroid') {
          gameMainState.board.spawnAsteroid();
        } else if (cheat.code === 'force_state') {
          this.gameState = cheat.state;
        } else if (cheat.code === 'fast_enemies') {
          // TODO
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
