import Board from '../entities/Board';
import HUD from '../interface/HUD';
import { Game } from '../index';
import Doors from '../interface/Doors';
import { ColorPosition } from '../../../common/types';
import {
  ThrusterDirection,
  Wave,
  VERY_LOW_HEALTH,
  LOW_HEALTH,
} from '../Session';

import Map from '../interface/Map';
import { COLORS, colorNameToLetter } from '../utils';
import { Cheat } from '../../../common/cheats';
import { times } from 'lodash';

export default class Main extends Phaser.State {
  public game: Game;

  private board: Board;
  private doors: Doors;
  private healthLowFx: Phaser.Sound;
  private healthVeryLowFx: Phaser.Sound;
  private healthLowTimer: Phaser.Timer;

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
      'id_card_0',
      'assets/sprites/id_card_0_240x600.png',
      240,
      600,
    );

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

    // Minimap
    // tslint:disable-next-line:no-unused-expression
    new Map(this.game);

    // Periodically spawn an asteroid
    const asteroidSpawnIntervalSecs = 20;
    const asteroidTimer = this.game.time.create();
    asteroidTimer.loop(
      asteroidSpawnIntervalSecs * 1000,
      this.board.spawnAsteroid,
      this.board,
    );
    asteroidTimer.start();

    this.healthLowTimer = this.game.time.create();

    // Score timer
    const scoreTimer = this.game.time.create();
    scoreTimer.loop(250, this.onScoreTimer, this);
    scoreTimer.start();

    // Keyboard shortcuts (for debugging)
    this.addKeyboardShortcuts();

    this.healthLowFx = this.game.add.audio('health_low');
    this.healthVeryLowFx = this.game.add.audio('health_very_low');

    // Bind signals
    this.game.session.signals.health.add(this.onHealthChanged, this);
    this.game.session.signals.cheat.add(this.onCheat, this);
    this.game.session.signals.wave.add(this.onWaveChanged, this);

    this.game.world.bringToTop(this.doors);
    this.doors.open(() => {
      this.game.session.state = 'in_game';
    });

    this.game.session.signals.debugFlagsChanged.add(() => {
      console.log('lol');
      if (this.game.session.debugFlags.boss) {
        this.board.spawnBoss();
      }
    }, this);
  }

  private addKeyboardShortcuts() {
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.board.spawnEnemy(), this);

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

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.UP)
      .onDown.add(
        () => this.game.session.signals.move.dispatch(ThrusterDirection.Up),
        this,
      );

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.UP)
      .onUp.add(
        () =>
          this.game.session.signals.move.dispatch(ThrusterDirection.Stopped),
        this,
      );

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.DOWN)
      .onUp.add(
        () =>
          this.game.session.signals.move.dispatch(ThrusterDirection.Stopped),
        this,
      );

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.DOWN)
      .onDown.add(
        () => this.game.session.signals.move.dispatch(ThrusterDirection.Down),
        this,
      );

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

  private onWaveChanged(wave: Wave) {
    console.log('wave changed', wave);
    if (wave.name === 'boss') {
      this.board.spawnBoss();
    } else {
      const numEnemies = wave.enemies!;
      times(numEnemies, i => {
        this.board.spawnEnemy(
          this.board.height / numEnemies * (i + 1) -
            this.board.height / numEnemies / 2,
        );
      });
    }
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
    this.doors.close(() => {
      this.game.state.start('After');
    });
  }
}
