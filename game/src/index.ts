import './index.css';

import { has, values } from 'lodash';
import Stats from 'stats.js';
import Main from './states/Main';
import Boot from './states/Boot';
import Before from './states/Before';
import Preload from './states/Preload';
import After from './states/After';

import Session from './Session';

function getUrlParams(search: string): { [P in string]: string } {
  const hashes = search.slice(search.indexOf('?') + 1).split('&');
  const params = {};
  hashes.forEach(hash => {
    const [key, val] = hash.split('=');
    params[key] = decodeURIComponent(val);
  });

  return params;
}

interface Config {
  serverURL: string;
  skip: boolean;
}

function getConfig() {
  const urlParams = getUrlParams(window.location.search);

  const config: Config = {
    serverURL: has(urlParams, 'serverURL')
      ? urlParams.serverURL
      : 'http://server.toomanycaptains.com',
    skip: has(urlParams, 'skip'),
  };
  return config;
}

export class Game extends Phaser.Game {
  public params: Config;
  public session: Session;

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

    this.session = new Session(this.params.serverURL);

    // Kick things off with the boot state.
    this.state.start('Boot');

    this.state.onStateChange.add(this.onStateChange, this);
  }

  public updateSoundtrack() {
    let key = '';
    if (this.session.state === 'wait_for_players') {
      key = 'music_background';
    } else if (this.session.state === 'in_game') {
      key = this.session.wave.soundtrack;
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
      this.soundtrack = this.add
        .audio(key, this.session.volume.music, true)
        .play();
    }
  }

  private onDebugFlagsChanged() {
    if (this.session.debugFlags.perf) {
      this.enablePerformanceStatistics();
    } else {
      this.disablePerformanceStatistics();
    }
  }

  private onVolumeChanged() {
    console.log('onVolumeChanged');
    console.log(this.session.volume);
    this.sound.volume = this.session.volume.master;
    this.soundtrack.volume = this.session.volume.music;
  }

  private enablePerformanceStatistics() {
    const statsEl = document.getElementById('stats');
    if (statsEl) {
      statsEl.style.display = 'unset';
      return;
    }
    // Setup the new stats panel.
    const stats = new Stats();
    stats.dom.id = 'stats';
    document.body.appendChild(stats.dom);

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.update;
    this.update = (...args: any[]) => {
      stats.begin();
      updateLoop.apply(this, args);
      stats.end();
    };
  }

  private disablePerformanceStatistics() {
    const statsEl = document.getElementById('stats');
    if (statsEl) {
      statsEl.style.display = 'none';
    }
  }

  private onStateChange() {
    // When the phaser state (NOT gamestate) changes,
    // we need to un-bind all of the existing signals!
    values(this.session.signals).forEach(signal => {
      signal.removeAll();
      // XXX: Hack for two reasons. One, we need to re-attach the signal handlers
      // after removing them all. Two, we only want to bind after
      // the sound system is atually set up!
      if (['Before', 'Main', 'After'].includes(this.state.current)) {
        this.session.signals.state.add(this.updateSoundtrack, this);
        this.session.signals.wave.add(this.updateSoundtrack, this);
        this.session.signals.volume.add(this.onVolumeChanged, this);
        this.session.signals.debugFlagsChanged.add(
          this.onDebugFlagsChanged,
          this,
        );
      }
    });
  }
}

// tslint:disable-next-line:no-unused-expression
new Game();
