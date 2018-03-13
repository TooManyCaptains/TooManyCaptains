import Board from '../entities/Board';
import HUD from '../interface/HUD';
import { Game } from '../index';
import Doors from '../interface/Doors';
import { ColorPosition } from '../../../common/types';
import { ThrusterDirection } from '../Session';
// import { ThrusterDirection } from '../Session';

import Map from '../interface/Map';

export default class Main extends Phaser.State {
  public game: Game;

  private board: Board;
  // private recentlyEnded = false;
  private doors: Doors;
  private map: Map;

  public preload() {
    this.load.spritesheet(
      'explosion',
      'assets/sprites/explosion.png',
      160,
      160,
    );
    const enemyWidth = 150;
    const enemyHeight = 65;
    this.load.spritesheet(
      'enemy_RR',
      'assets/sprites/enemy_RR.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_RY',
      'assets/sprites/enemy_RY.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_RB',
      'assets/sprites/enemy_RB.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_YR',
      'assets/sprites/enemy_YR.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_YY',
      'assets/sprites/enemy_YY.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_YB',
      'assets/sprites/enemy_YB.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_BR',
      'assets/sprites/enemy_BR.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_BY',
      'assets/sprites/enemy_BY.png',
      enemyWidth,
      enemyHeight,
    );
    this.load.spritesheet(
      'enemy_BB',
      'assets/sprites/enemy_BB.png',
      enemyWidth,
      enemyHeight,
    );
    this.doors = new Doors(this.game);

    this.load.spritesheet('lock', 'assets/sprites/lock145x155.png', 145, 155);

    this.load.spritesheet(
      'id_card_0',
      'assets/sprites/id_card_0_240x600.png',
      240,
      600,
    );

    // New Sprites (Feb.24)

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

    const boardHeight = 680;

    // Add the game board
    this.board = new Board(this.game, this.game.width, boardHeight);

    // Panels for HUD
    // tslint:disable-next-line:no-unused-expression
    new HUD(this.game, 0, this.board.bottom);

    this.map = new Map(this.game);

    // Periodically spawn an asteroid
    const asteroidSpawnIntervalSecs = 20;
    const asteroidTimer = this.game.time.create();
    asteroidTimer.loop(asteroidSpawnIntervalSecs * 1000, () =>
      this.board.spawnAsteroid(),
    );
    asteroidTimer.start();

    // Periodically spawn a new enemy
    const enemySpawnIntervalSecs = 35;
    const enemyTimer = this.game.time.create();
    enemyTimer.loop(enemySpawnIntervalSecs * 1000, () =>
      this.board.spawnEnemy(),
    );
    enemyTimer.start();

    // Score timer
    const scoreTimer = this.game.time.create();
    scoreTimer.loop(250, this.onScoreTimer, this);
    scoreTimer.start();

    if (this.game.params.debug) {
      // Keyboard shortcuts (for debugging)
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
          () => this.game.session.onMove.dispatch(ThrusterDirection.Up),
          this,
        );

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.UP)
        .onUp.add(
          () => this.game.session.onMove.dispatch(ThrusterDirection.Stopped),
          this,
        );

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.DOWN)
        .onUp.add(
          () => this.game.session.onMove.dispatch(ThrusterDirection.Stopped),
          this,
        );

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.DOWN)
        .onDown.add(
          () => this.game.session.onMove.dispatch(ThrusterDirection.Down),
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
        .addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(() => this.game.session.onFire.dispatch(), this);
    }

    if (this.game.params.invulnerable) {
      const health = 10_000;
      this.game.session.maxHealth = health;
      this.game.session.health = health;
    }

    this.startNewSession();

    this.game.session.onHealthChanged.add(this.onHealthChanged, this);
  }

  private onHealthChanged() {
    const health = this.game.session.health;
    if (health <= LOW_HEALTH && !this.healthLowFx.isPlaying) {
      this.healthVeryLowFx.stop();
      this.healthLowFx.play();
    } else if (health <= VERY_LOW_HEALTH && !this.healthVeryLowFx.isPlaying) {
      this.healthLowFx.stop();
      this.healthVeryLowFx.play();
    }
  }

  private onScoreTimer() {
    this.game.session.score += 1;
    // this.scoreText.text = `SCORE: ${this.score}`;
  }

  private startNewSession() {
    this.game.world.bringToTop(this.doors);
    this.doors.open(() => {
      this.game.session.state = 'in_game';
    });
  }

  // private endSession() {
  //   this.game.session.state = 'game_over';
  //   this.recentlyEnded = true;
  //   this.game.world.bringToTop(this.doors);
  //   this.doors.close(() => {
  //     this.game.state.start('After');
  //   });
  //   window.setTimeout(() => (this.recentlyEnded = false), 7500);
  // }
}
