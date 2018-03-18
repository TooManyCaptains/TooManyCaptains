import Player from './Player';
import { Enemy } from '../entities/Enemy';
import Asteroid from './Asteroid';
import { Game } from '../index';
import { EnemyBullet, EnemyBulletPool } from './EnemyWeapon';
import { randomColor } from '../utils';
import { PlayerBullet } from './PlayerWeapon';
import { ColorPalette } from '../interface/Styles';
import Boss from './Boss';

export default class Board extends Phaser.Group {
  public game: Game;

  private enemyBulletPool: EnemyBulletPool;
  private player: Player;
  private boss: Boss;
  private enemies: Phaser.Group;
  private asteroids: Phaser.Group;
  private collideFx: Phaser.Sound;
  private damagedFx: Phaser.Sound;
  private shieldFx: Phaser.Sound;

  private spritesToDestroy: Set<Phaser.Sprite> = new Set();

  constructor(game: Game, width: number, height: number) {
    super(game);

    this.player = new Player(this.game, 150, height / 2);

    // Keep game sprites (which respect bounds) within the bounds of the board
    // this.game.world.setBounds(0, 0, width, height);
    this.game.physics.arcade.setBounds(0, 125, width - 100, height - 150);

    // Sound FX
    this.shieldFx = this.game.add.audio('shield');
    this.damagedFx = this.game.add.audio('damaged');
    this.collideFx = this.game.add.audio('collide');

    // Asteroids
    this.asteroids = new Phaser.Group(this.game, undefined, 'asteroids');
    this.add(this.asteroids);

    // Mask (overflow)
    const mask = this.game.add.graphics(0, 0, this);
    mask.beginFill(ColorPalette.Black);
    mask.drawRect(0, 0, width, height);
    this.mask = mask;

    // Create recycled bullet pool for enemy bullets
    this.enemyBulletPool = new EnemyBulletPool(this.game, this.player);

    this.enemies = new Phaser.Group(this.game, undefined, 'enemies');
    this.add(this.enemies);

    // Player ship
    this.add(this.player);
  }

  public spawnEnemy(y?: number) {
    this.enemies.add(
      new Enemy(
        this.game,
        y ? this.game.width : this.game.width + 50,
        y || this.game.physics.arcade.bounds.height * Math.random() + 100,
        randomColor(),
        randomColor(),
        this.enemyBulletPool,
      ),
    );
  }

  public spawnBoss() {
    this.boss = new Boss(this.game, this.width - 700, this.centerY / 2);
    this.boss.alpha = 1;
  }

  public spawnAsteroid() {
    const isPlayerCamping =
      this.game.session.shieldColors.length === 3 ||
      this.game.session.repairLevel === 3;
    // Punish players who are camping
    const y = isPlayerCamping
      ? this.player.y
      : this.game.physics.arcade.bounds.height * Math.random() + 100;
    const asteroid = new Asteroid(this.game, this.game.width, y);
    this.asteroids.add(asteroid);
    asteroid.events.onOutOfBounds.add(this.onAsteroidOutOfBounds, this);
  }

  public update() {
    // Player <-> enemy bullet collision
    this.game.physics.arcade.overlap(
      this.enemyBulletPool,
      this.player.ship,
      (playerShip: Phaser.Sprite, bullet: EnemyBullet) => {
        const playerHasMatchingShield = this.game.session.shieldColors.some(
          color => color === bullet.color,
        );
        // Bullet hits
        if (
          this.game.session.shieldColors.length === 0 ||
          !playerHasMatchingShield
        ) {
          this.game.session.health -= bullet.strength;
          this.damagedFx.play();
          this.game.camera.shake(0.005, 400);
          this.expolosion(bullet.x, bullet.y, 0.5);
        } else {
          this.game.session.health -= bullet.strength * 0.05;
          this.player.shieldTint();
          this.shieldFx.play();
        }
        bullet.kill();
      },
    );

    // Enemy <-> enemy collision
    this.game.physics.arcade.collide(this.enemies, this.enemies);

    // Enemy <-> player bullet collision
    this.game.physics.arcade.overlap(
      this.enemies,
      this.player.weapon,
      (enemy: Enemy, playerBullet: PlayerBullet) => {
        const playerBulletCanHurtEnemy = playerBullet.color.includes(
          enemy.shipColor,
        );
        // Bullet hits
        if (playerBulletCanHurtEnemy) {
          this.spritesToDestroy.add(enemy);
          this.game.session.score += 150;
        } else {
          this.shieldFx.play();
        }
        playerBullet.kill();
      },
    );

    // Enemy <-> player ship (no shield) collision
    this.game.physics.arcade.overlap(
      this.enemies,
      this.player.ship,
      (playerShip: Phaser.Sprite, enemy: Enemy) => {
        this.spritesToDestroy.add(enemy);
        this.game.session.health -= enemy.collisionDamage;
      },
    );

    // Player <-> asteroid collision
    this.game.physics.arcade.overlap(
      this.asteroids,
      this.player.ship,
      (playerShip: Phaser.Sprite, asteroid: Asteroid) => {
        this.expolosion(asteroid.x, asteroid.y, 1.0);
        this.spritesToDestroy.add(asteroid);
        this.game.camera.shake(0.02, 800);
        this.game.session.health -= asteroid.collisionDamage;
      },
    );

    // Player bullet <-> asteroid collision
    this.game.physics.arcade.overlap(
      this.asteroids,
      this.player.weapon,

      (asteroid: Asteroid, playerBullet: PlayerBullet) => {
        this.movingExplosion(
          playerBullet.x,
          playerBullet.y,
          (asteroid.body as Phaser.Physics.Arcade.Body).velocity,
          0.4,
        );
        playerBullet.kill();
      },
    );

    // Destroying a sprite sets all of its properties to null,
    // causing any subsequent operations on the sprite to fail.
    // This can happen if a sprite is destroyed "twice", such as if
    // multiple bullets hit a target causing it to be destroyed.
    // Therefore, rather than destroying the target immediately,
    // we mark it for destruction by adding it to a set.
    // Then, afterwords, we destroy the targets exactly once.
    this.spritesToDestroy.forEach(sprite => sprite.destroy());
    this.spritesToDestroy.clear();

    super.update();
  }

  private onAsteroidOutOfBounds(asteroid: Asteroid) {
    this.game.session.score += 250;
  }

  private expolosion(x: number, y: number, scale: number) {
    const explosion = this.game.add.sprite(x, y, 'explosion-yellow');
    explosion.scale.setTo(scale, scale);
    explosion.anchor.setTo(0.75, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.collideFx.play();
  }

  private movingExplosion(
    x: number,
    y: number,
    velocity: Phaser.Point,
    scale: number,
  ) {
    const explosion = this.game.add.sprite(x, y, 'explosion-yellow');
    this.game.physics.enable(explosion, Phaser.Physics.ARCADE);
    (explosion.body as Phaser.Physics.Arcade.Body).velocity = velocity;
    explosion.scale.setTo(scale, scale);
    explosion.anchor.setTo(0, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.collideFx.play();
  }
}
