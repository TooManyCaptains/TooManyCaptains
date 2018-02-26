import Board from '../entities/Board';
import HUD from '../interface/HUD';
import { GameState, Color, ButtonState } from '../../../common/types';
import PlayerShip from '../entities/PlayerShip';
import { Game } from '../index';
import Doors from '../interface/Doors';

export default class Main extends Phaser.State {
  public game: Game;

  private recentlyEnded = false;
  private gameState: GameState = 'wait_for_players';
  private player: PlayerShip;
  private captainRechargePerSecond = 0.1;
  private captainRechargeTimerFreq = 50;
  private doors: Doors;
  private board: Board;

  public preload() {
    // this.load.spritesheet(
    //   'player-ship',
    //   'assets/sprites/player-ship.png',
    //   200,
    //   120,
    // );
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

    this.load.spritesheet(
      'lock',
      'assets/sprites/lock145x155.png',
      145,
      155
    );

    this.load.spritesheet(
      'id_card_0',
      'assets/sprites/id_card_0_240x600.png',
      240,
      600
    );

    // New Sprites (Feb.24)

    this.load.spritesheet(
      'player-ship',
      'assets/sprites/ship_220x100.png',
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
  }





  public create() {
    // Background
    this.game.add
      .tileSprite(0, 0, this.game.width, 730, 'background', undefined)
      .autoScroll(-10, 0);

    // Add the game board
    this.board = new Board(this.game, this.game.width, 680);
    this.player = this.board.player;

    // Recharge captains energy
    this.game.time
      .create()
      .loop(this.captainRechargeTimerFreq, this.onRechargeCaptains, this)
      .timer.start();

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

    // Keyboard shortcuts (for debugging)
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.board.spawnEnemy(), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.A)
      .onDown.add(() => this.board.spawnAsteroid(), this);

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.K)
      .onDown.add(() => this.player.kill(), this);

    this.game.input.keyboard
    .addKey(Phaser.Keyboard.D)
    .onDown.add(() => this.player.damage(5), this);

    this.game.input.keyboard
    .addKey(Phaser.Keyboard.S)
    .onDown.add(() => this.game.captains = this.game.captains.map(captain => ({...captain, charge: 0}), this));

    this.game.server.notifyGameState(this.gameState);

    if (this.game.params.invulnerable) {
      const health = 100 * 1000;
      this.player.maxHealth = health;
      this.player.health = health;
    }

    this.startGame();
  }

  public onMoveUp() {
    if (this.player.batteries.thrusters > 0) {
      this.player.startMovingUp();
    }
  }

  public onMoveDown() {
    if (this.player.batteries.thrusters > 0) {
      this.player.startMovingDown();
    }
  }

  public onMoveStop() {
    this.player.stopMoving();
  }

  public onWeaponsChanged(colors: Color[]) {
    this.player.setWeapons(colors);
  }

  public onShieldsChanged(colors: Color[]) {
    this.player.setShields(colors);
  }

  public onThrustersChanged(colors: Color[]) {
    this.player.setThrustersLevel(colors.length);
  }

  public onRepairsChanged(colors: Color[]) {
    this.player.setRepairLevel(colors.length);
  }

  public onFire(state: ButtonState) {
    if (this.player.batteries.weapons === 0) {
      return;
    }
    if (state === 'pressed') {
      this.player.startChargingWeapon.call(this.player);
    } else if (state === 'released') {
      this.player.stopChargingWeaponAndFireIfPossible();
    }
  }

  public update() {
    const isGameEnding = !this.player.alive;

    // Did the game just end now (i.e. it was previously not ended)?
    if (isGameEnding && this.gameState === 'in_game') {
      this.endGame();
    }
  }

  private onRechargeCaptains() {
    const delta =
      this.captainRechargePerSecond * (this.captainRechargeTimerFreq / 1000);
    this.game.captains = this.game.captains.map(captain => {
      captain.charge = Math.min(1, captain.charge + delta);
      return captain;
    });
  }

  private startGame() {
    this.game.world.bringToTop(this.doors);
    this.doors.open(() => {
      this.gameState = 'in_game';
      this.game.server.notifyGameState(this.gameState);
    });
  }

  private endGame() {
    this.gameState = 'game_over';
    this.game.server.notifyGameState(this.gameState);
    this.recentlyEnded = true;
    this.game.world.bringToTop(this.doors);
    this.doors.close(() => {
      this.game.state.start('After');
    });
    window.setTimeout(() => (this.recentlyEnded = false), 7500);
  }
}
