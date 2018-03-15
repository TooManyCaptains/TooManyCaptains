import { has, values } from 'lodash';
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

  private soundtrack: Phaser.Sound;

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

    this.state.onStateChange.add(this.onStateChange, this);
    this.session.signals.state.add(this.updateSoundtrack, this);
    this.session.signals.wave.add(this.updateSoundtrack, this);
  }

  public updateSoundtrack() {
    let key = '';
    let volume = 0.25;
    if (this.session.state === 'wait_for_players') {
      key = 'music_background';
    } else if (this.session.state === 'in_game') {
      key = this.session.wave.soundtrack;
      volume = 0.2;
    }
    // We're not supposed to be playing anything
    if (key === '') {
      if (this.soundtrack) {
        this.soundtrack.stop();
      }
      return;
    }
    // No soundtrack yet
    if (!this.soundtrack || this.soundtrack.key !== key) {
      if (this.soundtrack) {
        this.soundtrack.stop();
      }
      this.soundtrack = this.add.audio(key, volume, true).play();
    }
  }

  // public setVolume(volume?: number) {
  //   if (volume !== undefined) {
  //     localStorage.setItem('volume', String(volume));
  //     this.sound.volume = volume;
  //   } else {
  //     const previousVolume = localStorage.getItem('volume');
  //     if (previousVolume !== null) {
  //       this.setVolume(Number(previousVolume));
  //     }
  //   }
  // }

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

  private onStateChange() {
    // When the phaser state (NOT gamestate) changes,
    // we need to un-bind all of the existing signals!
    values(this.session.signals).forEach(signal => {
      signal.removeAll();
      this.session.signals.state.add(this.updateSoundtrack, this);
      this.session.signals.wave.add(this.updateSoundtrack, this);
    });
  }
}

// tslint:disable-next-line:no-unused-expression
new Game();
