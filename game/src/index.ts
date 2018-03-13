import { has } from 'lodash';
import Stats from 'stats.js';
import Main from './states/Main';
import Boot from './states/Boot';
import Before from './states/Before';
import Preload from './states/Preload';
import After from './states/After';
import GameServer from './GameServer';

import './index.css';
import Session from './Session';

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
  public session: Session;
  private server: GameServer;

  constructor() {
    super(1920, 1080, Phaser.CANVAS, 'surface');
    this.state.add('Boot', Boot, false);
    this.state.add('Preload', Preload, false);
    this.state.add('Before', Before, false);
    this.state.add('Main', Main, false);
    this.state.add('After', After, false);

    this.params = getConfig();
    console.log(this.params);

    if (this.params.debug) {
      this.setupPerformanceStatistics();
    }

    this.server = new GameServer(this.params.serverURL);
    this.session = new Session(this.server);

    // Kick things off with the boot state.
    this.state.start('Boot');
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
