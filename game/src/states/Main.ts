import Board from '../entities/Board';
import HUD from '../interface/HUD';
import { ButtonState, ColorPosition } from '../../../common/types';
import PlayerShip from '../entities/PlayerShip';
import { Game } from '../index';
import Doors from '../interface/Doors';
import { sortBy } from 'lodash';
import { EnemyBulletPool } from '../entities/EnemyWeapon';

export default class Main extends Phaser.State {
  public game: Game;
  public board: Board;

  private recentlyEnded = false;
  private player: PlayerShip;
  private doors: Doors;

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
      'ship-thurster',
      'assets/sprites/ship_thurster_220x100.png',
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
    this.player = this.board.player;

    // Panels for HUD
    // tslint:disable-next-line:no-unused-expression
    new HUD(this.game, 0, this.board.bottom, this.game.width, 410);

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

    if (this.game.params.debug) {
      // Keyboard shortcuts (for debugging)
      this.game.input.keyboard
        .addKey(Phaser.Keyboard.E)
        .onDown.add(() => this.board.spawnEnemy(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.A)
        .onDown.add(() => this.board.spawnAsteroid(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.T)
        .onDown.add(() => this.player.setThrustersLevel(2), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.UP)
        .onDown.add(() => this.player.startMovingUp(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.UP)
        .onUp.add(() => this.player.stopMoving(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.DOWN)
        .onUp.add(() => this.player.stopMoving(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.DOWN)
        .onDown.add(() => this.player.startMovingDown(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.K)
        .onDown.add(() => this.player.kill(), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.D)
        .onDown.add(() => this.player.damage(2.5), this);

      this.game.input.keyboard
      .addKey(Phaser.Keyboard.H)
      .onDown.add(() => this.player.heal(5), this);

      this.game.input.keyboard
        .addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(() => this.player.fireWeapon(), this);
    }

    if (this.game.params.invulnerable) {
      const health = 100 * 1000;
      this.player.maxHealth = health;
      this.player.health = health;
    }

    this.game.enemyBullets = new EnemyBulletPool(this.game);

    this.startGame();
  }

  public onMoveUp() {
    this.player.startMovingUp();
  }

  public onMoveDown() {
    this.player.startMovingDown();
  }

  public onMoveStop() {
    this.player.stopMoving();
  }

  public onWeaponsConfiguration(colorPositions: ColorPosition[]) {
    this.player.setWeapons(colorPositions);
  }

  public onShieldsConfiguration(colorPositions: ColorPosition[]) {
    const colors = sortBy(colorPositions, 'color').map(cp => cp.color);
    this.player.setShields(colors);
  }

  public onThrustersConfiguration(colorPositions: ColorPosition[]) {
    this.player.setThrustersLevel(colorPositions.length);
  }

  public onRepairsConfiguration(colorPositions: ColorPosition[]) {
    this.player.setRepairLevel(colorPositions.length);
  }

  public onFire(state: ButtonState) {
    if (state === 'released') {
      this.player.fireWeapon();
    }
  }

  public update() {
    const isGameEnding = !this.player.alive;

    // Did the game just end now (i.e. it was previously not ended)?
    if (isGameEnding && this.game.gameState === 'in_game') {
      this.endGame();
    }
  }

  private startGame() {
    this.game.world.bringToTop(this.doors);
    this.doors.open(() => {
      this.game.gameState = 'in_game';
    });
  }

  private endGame() {
    this.game.gameState = 'game_over';
    this.recentlyEnded = true;
    this.game.world.bringToTop(this.doors);
    this.doors.close(() => {
      this.game.state.start('After');
    });
    window.setTimeout(() => (this.recentlyEnded = false), 7500);
  }
}
