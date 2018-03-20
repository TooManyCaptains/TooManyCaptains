import Board from '../entities/Board';
import HUD from '../interface/HUD';
import { Game } from '../index';
import Doors from '../interface/Doors';
import { ColorPosition } from '../../../common/types';
import { ThrusterDirection, VERY_LOW_HEALTH, LOW_HEALTH } from '../Session';

// import Map from '../interface/Map';
import { COLORS, colorNameToLetter } from '../utils';
import { Cheat } from '../../../common/cheats';
import { times, clone } from 'lodash';
import { baseStyle, ColorPalette } from '../interface/Styles';

class ScoreInfo extends Phaser.Group {
  private text: Phaser.Text;
  private icon: Phaser.Sprite;
  private background: Phaser.Graphics;

  private w = 270;
  private h = 70;
  private paddingTop = 10;
  private paddingSide = 25;

  constructor(public game: Game, x: number, y: number) {
    super(game);
    this.x = x;
    this.y = y;
    // Icon
    this.icon = this.game.add.sprite(
      0,
      this.paddingTop,
      'icon-score',
      null,
      this,
    );
    // this.icon.anchor.setTo(0.5, 0);
    this.icon.scale.setTo(0.5, 0.5);

    // Text
    this.text = this.game.add.text(
      0,
      this.paddingTop,
      '',
      { ...baseStyle },
      this,
    );
    this.text.anchor.setTo(0, 0);
    // this.text.width = width;

    // Background
    this.background = this.game.add.graphics(0, 0, this);

    this.bringToTop(this.text);
    this.bringToTop(this.icon);

    // Listen for changes to score
    this.game.session.signals.score.add(this.onScoreChanged, this);
    this.onScoreChanged();
  }

  private onScoreChanged() {
    this.text.text = `SCORE: ${this.game.session.score}`;
    const scoreLength = String(this.game.session.score).length;
    const letterSize = 22.5;
    const bgLeft = -this.w / 2 - letterSize / 2 * scoreLength;

    this.background.clear();
    this.background.beginFill(ColorPalette.Black, 1);
    this.background.drawRoundedRect(
      bgLeft,
      0,
      this.w + letterSize * scoreLength,
      this.h,
      100,
    );
    this.background.lineStyle(2, ColorPalette.White, 1);
    this.background.drawRoundedRect(
      bgLeft,
      0,
      this.w + letterSize * scoreLength,
      this.h,
      100,
    );

    this.text.x = bgLeft + this.paddingSide + 70;
    this.icon.x = bgLeft + this.paddingSide;
  }
}

interface Wave {
  number: number;
  seconds: number;
  enemies: number;
  modifiers: {
    enemyMoveSpeed: number;
    enemyFireInterval: number;
    asteroidSpawnInterval: number;
    asteroidMoveSpeed: number;
  };
}

export default class Main extends Phaser.State {
  public game: Game;

  private board: Board;
  private doors: Doors;
  private scoreInfo: ScoreInfo;
  private healthLowFx: Phaser.Sound;
  private healthVeryLowFx: Phaser.Sound;
  private healthLowTimer: Phaser.Timer;
  private soundtrack: Phaser.Sound;
  private waveTimer: Phaser.Timer;
  private wave: Wave;
  private asteroidTimer: Phaser.Timer;
  private asteroidSpawnIntervalSecs = 20;

  public preload() {
    // Load all enemies
    const enemyWidth = 150;
    const enemyHeight = 65;
    const letters = COLORS.map(colorNameToLetter);
    letters.forEach(char1 => {
      letters.forEach(char2 => {
        const key = `enemy_${char1}${char2}`;
        this.load.spritesheet(
          key,
          `assets/sprites/${key}.png`,
          enemyWidth,
          enemyHeight,
        );
      });
    });

    this.load.spritesheet(
      'explosion',
      'assets/sprites/explosion.png',
      160,
      160,
    );

    this.doors = new Doors(this.game);

    this.load.spritesheet(
      'player-ship',
      'assets/sprites/ship-220x100.png',
      220,
      100,
    );

    this.load.spritesheet(
      'ship-weapon-light-top',
      'assets/sprites/ship_weapon_light_1_220x100.png',
      220,
      100,
    );

    this.load.spritesheet(
      'ship-weapon-light-middle',
      'assets/sprites/ship_weapon_light_2_220x100.png',
      220,
      100,
    );

    this.load.spritesheet(
      'ship-weapon-light-bottom',
      'assets/sprites/ship_weapon_light_3_220x100.png',
      220,
      100,
    );

    this.load.spritesheet(
      'ship-shield',
      'assets/sprites/ship_shield_220x120.png',
      220,
      120,
    );

    this.load.spritesheet(
      'ship-thruster',
      'assets/sprites/ship_thruster_220x100.png',
      220,
      100,
    );

    this.load.spritesheet(
      'ship-repair',
      'assets/sprites/ship_repair_220x100.png',
      220,
      100,
    );

    this.load.spritesheet(
      'explosion-yellow',
      'assets/sprites/explosion_yellow_160x160.png',
      160,
      160,
    );
  }

  public create() {
    // Background
    this.game.add
      .tileSprite(0, 0, this.game.width, 730, 'background', undefined)
      .autoScroll(-10, 0);

    // Add the game board
    this.board = new Board(this.game, this.game.width, 680);

    // HUD at bottom of screen
    // tslint:disable-next-line:no-unused-expression
    new HUD(this.game, 0, this.board.bottom);

    // Show score at top of screen
    this.scoreInfo = new ScoreInfo(this.game, this.game.world.centerX, 15);
    this.scoreInfo.x = this.scoreInfo.x;

    this.asteroidTimer = this.game.time.create();

    // Score timer
    const scoreTimer = this.game.time.create();
    scoreTimer.loop(250, this.onScoreTimer, this);
    scoreTimer.start();

    // Waves
    this.waveTimer = this.game.time.create();

    // Keyboard shortcuts (for debugging)
    this.addKeyboardShortcuts();

    // Health
    this.healthLowFx = this.game.add.audio('health_low');
    this.healthVeryLowFx = this.game.add.audio('health_very_low');
    this.healthLowTimer = this.game.time.create();

    // Bind signals
    this.game.session.signals.health.add(this.onHealthChanged, this);
    this.game.session.signals.cheat.add(this.onCheat, this);
    this.game.session.signals.volume.add(this.onVolumeChanged, this);

    this.game.world.bringToTop(this.doors);
    this.doors.open(() => this.onDoorsOpened());
  }

  private getNextWave(): Wave {
    const currentWave = clone(this.wave);
    if (!this.wave) {
      return {
        number: 0,
        seconds: 2,
        enemies: 2,
        modifiers: {
          enemyFireInterval: 1.0,
          enemyMoveSpeed: 1.0,
          asteroidMoveSpeed: 1.0,
          asteroidSpawnInterval: 1.0,
        },
      };
    } else if (this.wave.number === 0) {
      return {
        number: 1,
        seconds: 20,
        enemies: 4,
        modifiers: {
          enemyFireInterval: 1.0,
          enemyMoveSpeed: 1.0,
          asteroidMoveSpeed: 1.0,
          asteroidSpawnInterval: 1.0,
        },
      };
    } else if (this.wave.number === 1) {
      return {
        number: 2,
        seconds: 30,
        enemies: 5,
        modifiers: {
          enemyFireInterval: 1.0,
          enemyMoveSpeed: 1.0,
          asteroidMoveSpeed: 1.0,
          asteroidSpawnInterval: 1.0,
        },
      };
    } else {
      return {
        number: currentWave.number + 1,
        seconds: 30,
        enemies: Math.min(15, currentWave.enemies * 1.5),
        modifiers: {
          enemyFireInterval: currentWave.modifiers.enemyFireInterval * 0.9,
          enemyMoveSpeed: currentWave.modifiers.enemyMoveSpeed * 1.1,
          asteroidMoveSpeed: currentWave.modifiers.asteroidMoveSpeed * 1.1,
          asteroidSpawnInterval:
            currentWave.modifiers.asteroidSpawnInterval * 0.9,
        },
      };
    }
  }

  private onDoorsOpened() {
    this.game.session.state = 'in_game';
    this.nextSoundtrack();
    this.wave = this.getNextWave();
    this.onWaveTimer();
  }

  private onDoorsClosed() {
    this.game.state.start('After');
  }

  private onWaveTimer() {
    this.waveTimer.add(
      this.wave.seconds * 1000,
      () => {
        this.spawnWave(this.wave);
        this.wave = this.getNextWave();
        this.onWaveTimer();
      },
      this,
    );
    this.waveTimer.start();
  }

  private onAsteroidTimer() {
    this.asteroidTimer.add(
      this.asteroidSpawnIntervalSecs *
        this.wave.modifiers.asteroidSpawnInterval *
        1000,
      () => {
        this.board.spawnAsteroid(this.wave.modifiers.asteroidMoveSpeed);
        this.spawnWave(this.wave);
        this.onAsteroidTimer();
      },
      this,
    );
    this.asteroidTimer.start();
  }

  private nextSoundtrack() {
    if (this.game.session.state !== 'in_game') {
      return;
    }
    let key = 'music_stage_4';
    if (!this.soundtrack) {
      key = 'music_stage_2';
    } else if (this.soundtrack.key === 'music_stage_2') {
      key = 'music_stage_3';
    }
    this.soundtrack = this.game.add
      .sound(key, this.game.session.volume.music, false)
      .play();
    console.log('changing soundtrack to: ', key);
    this.soundtrack.onStop.addOnce(this.nextSoundtrack, this);
  }

  private onVolumeChanged() {
    if (this.soundtrack) {
      this.soundtrack.volume = this.game.session.volume.music;
    }
  }

  private addKeyboardShortcuts() {
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.board.spawnEnemy(undefined), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.A)
      .onDown.add(() => this.board.spawnAsteroid(), this);

    this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => {
      const allPositions: ColorPosition[] = [
        { color: 'blue', position: 0 },
        { color: 'red', position: 1 },
        { color: 'yellow', position: 2 },
      ];
      this.game.session.configurations = [
        {
          subsystem: 'weapons',
          colorPositions: allPositions,
        },
        {
          subsystem: 'shields',
          colorPositions: allPositions,
        },
        {
          subsystem: 'repairs',
          colorPositions: allPositions,
        },
        {
          subsystem: 'thrusters',
          colorPositions: allPositions.slice(0, 2),
        },
      ];
    }, this);

    this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(() => {
      this.game.session.thrusterDirection = ThrusterDirection.Up;
      this.game.session.signals.move.dispatch(ThrusterDirection.Up);
    }, this);

    this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(() => {
      this.game.session.thrusterDirection = ThrusterDirection.Stopped;
      this.game.session.signals.move.dispatch(ThrusterDirection.Stopped);
    }, this);

    this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onUp.add(() => {
      this.game.session.thrusterDirection = ThrusterDirection.Stopped;
      this.game.session.signals.move.dispatch(ThrusterDirection.Stopped);
    }, this);

    this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(() => {
      this.game.session.thrusterDirection = ThrusterDirection.Down;
      this.game.session.signals.move.dispatch(ThrusterDirection.Down);
    }, this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.K)
      .onDown.add(() => (this.game.session.health = 0), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.D)
      .onDown.add(() => (this.game.session.health -= 5), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.H)
      .onDown.add(() => (this.game.session.health += 5), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.S)
      .onDown.add(() => (this.game.session.score *= 2), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.SPACEBAR)
      .onDown.add(() => this.game.session.signals.fire.dispatch(), this);
  }

  private onCheat(cheat: Cheat) {
    if (cheat.code === 'kill_player') {
      this.game.session.health = 0;
    } else if (cheat.code === 'spawn_enemy') {
      this.board.spawnEnemy();
    } else if (cheat.code === 'spawn_asteroid') {
      this.board.spawnAsteroid();
    }
  }

  private onHealthChanged() {
    const flashScreen = (delay: number, opacity: number) => {
      this.healthLowTimer.stop();
      this.healthLowTimer.loop(delay, () => {
        this.game.camera.flash(0xff0000, delay, true, opacity);
      });
      this.game.camera.flash(0xff0000, delay, true, opacity);
      this.healthLowTimer.start();
    };

    const health = this.game.session.health;
    if (health <= VERY_LOW_HEALTH && !this.healthVeryLowFx.isPlaying) {
      this.healthLowFx.stop();
      this.healthVeryLowFx.play();
      this.healthVeryLowFx.volume = 0.6;
      flashScreen(800, 0.5);
    } else if (
      health > VERY_LOW_HEALTH &&
      health <= LOW_HEALTH &&
      !this.healthLowFx.isPlaying
    ) {
      this.healthVeryLowFx.stop();
      this.healthLowFx.play();
      this.healthLowFx.volume = 0.4;
      flashScreen(1200, 0.25);
    }

    if (health > LOW_HEALTH) {
      this.healthLowFx.stop();
      this.healthVeryLowFx.stop();
      this.healthLowTimer.stop();
      this.game.camera.resetFX();
    }

    // Player is dead!
    if (health <= 0) {
      this.onPlayerDead();
    }
  }

  private spawnWave(wave: Wave) {
    console.log(`spawning wave #${wave.number}`);
    console.log(wave);
    const numEnemies = wave.enemies!;
    times(numEnemies, i => {
      this.board.spawnEnemy(
        this.board.height / numEnemies * (i + 1) -
          this.board.height / numEnemies / 2,
        wave.modifiers.enemyMoveSpeed,
        wave.modifiers.enemyFireInterval,
      );
    });
  }

  private onScoreTimer() {
    this.game.session.score += 1;
  }

  private onPlayerDead() {
    // If game already ending, this function is a no-op.
    if (this.game.session.state === 'game_over') {
      return;
    }
    this.game.session.state = 'game_over';
    this.game.world.bringToTop(this.doors);
    this.doors.close(() => this.onDoorsClosed());
  }
}
