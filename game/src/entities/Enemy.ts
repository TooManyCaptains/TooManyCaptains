import { Color } from './../../../common/types';
import { Game } from '../index';
import { colorNameToLetter } from '../utils';
import { EnemyBulletPool } from './EnemyWeapon';

export class Enemy extends Phaser.Sprite {
  public game: Game;
  public body: Phaser.Physics.Arcade.Body;
  public explosionFx: Phaser.Sound;

  public collisionDamage = 35;
  public movementSpeed = 7.5;
  public verticalDriftSpeed = 7.5;
  public checkWorldBounds = true;

  public bulletStrength = 10;
  public bulletVelocity = -200;

  public shipColor: Color;
  public weaponColor: Color;

  private baseFiringRate = 10000;
  private fireTimer: Phaser.Timer;

  private shield: Phaser.Sprite;

  private enemyBulletPool: EnemyBulletPool;

  constructor(
    game: Game,
    x: number,
    y: number,
    shipColor: Color,
    weaponColor: Color,
    enemyBulletPool: EnemyBulletPool,
  ) {
    super(
      game,
      x,
      y,
      `enemy_${colorNameToLetter(shipColor)}${colorNameToLetter(weaponColor)}`,
    );
    this.animations.add('move');
    this.animations.play('move', 15, true);

    this.shipColor = shipColor;
    this.weaponColor = weaponColor;
    this.enemyBulletPool = enemyBulletPool;

    // Size and anchoring
    this.anchor.setTo(0.5, 0.5);

    // Health
    this.health = 20;
    this.maxHealth = this.health;

    // Weapon
    this.fireTimer = this.game.time.create();
    this.fireTimer.loop(
      this.baseFiringRate + this.baseFiringRate * Math.random(),
      () => this.fire(),
    );
    this.fireTimer.start();

    // Physics and movement
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    this.body.bounce.set(1);
    this.body.velocity.x =
      -this.movementSpeed + this.movementSpeed * Math.random();
    this.body.velocity.y =
      Math.random() > 0.5 ? this.verticalDriftSpeed : -this.verticalDriftSpeed;

    // Hitbox size adjustment
    this.body.setSize(102, 38, 13.5, 12.5);

    this.explosionFx = this.game.add.audio('explosion');
  }

  public update() {
    super.update();
    // Don't go beyond midway-ish point
    if (this.x <= this.game.world.centerX * Math.random() * 0.95) {
      this.body.velocity.setMagnitude(0);
    }
  }

  public destroy() {
    this.explode();
    this.fireTimer.stop();
    if (this.shield) {
      this.shield.destroy();
    }
    super.destroy();
  }

  public fire() {
    this.enemyBulletPool.fire(this);
  }

  public flashShield(color: Color) {
    const key = `shield-enemy-${colorNameToLetter(color)}`;
    if (this.shield) {
      this.shield.loadTexture(key);
    } else {
      this.shield = this.game.add.sprite(this.x, this.y, key);
      this.shield.anchor.setTo(0.5, 0.5);
      this.shield.update = () => {
        this.shield.x = this.x;
        this.shield.y = this.y;
      };
    }
    this.shield.alpha = 1;
    this.game.add
      .tween(this.shield)
      .to({ alpha: 0 }, 750, Phaser.Easing.Cubic.In, true);
  }

  private explode() {
    const explosion = this.game.add.sprite(this.x, this.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.explosionFx.play();
  }
}
