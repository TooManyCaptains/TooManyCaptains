// import HealthBar from './HealthBar';
import { Color } from './../../../common/types';
import { Game } from '../index';
import Board from './Board';
import { colorNameToLetter } from '../utils';

export class Enemy extends Phaser.Sprite {
  public explosionFx: Phaser.Sound;

  public collisionDamage = 35;
  public movementSpeed = 7.5;
  public verticalDriftSpeed = 7.5;
  public outOfBoundsKill = true;
  public checkWorldBounds = true;

  public bulletDamage: 12.5;
  public game: Game;
  public color: Color;

  public shipColor: Color;
  public weaponColor: Color;

  private baseFiringRate = 10000;
  private fireTimer: Phaser.Timer;

  constructor(
    game: Game,
    x: number,
    y: number,
    shipColor: Color,
    weaponColor: Color,
  ) {
    super(game, x, y, `enemy_${colorNameToLetter(shipColor)}${colorNameToLetter(weaponColor)}`);
    this.animations.add('move');
    this.animations.play('move', 15, true);

    this.shipColor = shipColor;
    this.weaponColor = weaponColor;

    // Size and anchoring
    this.anchor.setTo(0.5, 0.5);

    // Health
    this.health = 20;
    this.maxHealth = this.health;
    // tslint:disable-next-line:no-unused-expression
    // new HealthBar(this);

    // Weapon
    this.fireTimer = this.game.time.create();
    this.fireTimer.loop(this.baseFiringRate + (this.baseFiringRate * Math.random()), () =>
      this.fire(),
    );
    this.fireTimer.start();

    // Physics and movement
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    // this.body.collideWorldBounds = true
    this.body.bounce.set(1);
    this.body.velocity.x =
      -this.movementSpeed + this.movementSpeed * Math.random();
    this.body.velocity.y =
      Math.random() > 0.5 ? this.verticalDriftSpeed : -this.verticalDriftSpeed;

    // Hitbox size adjustment
    this.body.setSize(102, 38, 13.5, 12.5);

    this.explosionFx = this.game.add.audio('explosion');
  }

  public destroy() {
    this.explode();
    this.fireTimer.stop();
    super.destroy();
  }

  public update() {
    // Drift vertically
    if (this.y - this.height < 0) {
      this.body.velocity.y = this.verticalDriftSpeed;
    } else if (this.bottom > (this.parent.parent as Board).maxY) {
      this.body.velocity.y = -this.verticalDriftSpeed;
    }
  }

  public fire() {
    this.game.enemyBullets.fire(this.game, this);
  }

  private explode() {
    const explosion = this.game.add.sprite(this.x, this.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.explosionFx.play();
  }
}
