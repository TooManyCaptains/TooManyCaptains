// import HealthBar from './HealthBar';
import { Color } from './../../../common/types';
import { Weapon } from './Weapon';
import { Game } from '../index';
import Board from './Board';

export class Enemy extends Phaser.Sprite {
  public explosionFx: Phaser.Sound;
  public shipType: string;
  public weaponType: string;
  public collisionDamage = 35;
  public movementSpeed = 7.5;
  public verticalDriftSpeed = 7.5;
  public outOfBoundsKill = true;
  public checkWorldBounds = true;
  public weapon: Weapon;
  public bulletDamage: 12.5;
  public game: Game;
  public color: Color;

  constructor(
    game: Game,
    x: number,
    y: number,
    shipType = 'R',
    weaponType = 'R',
  ) {
    super(game, x, y, `enemy_${shipType}${weaponType}`);
    this.animations.add('move');
    this.animations.play('move', 15, true);

    if (shipType === 'R') {
      this.color = 'red';
    } else if (shipType === 'B') {
      this.color = 'blue';
    } else if (shipType === 'Y') {
      this.color = 'yellow';
    }

    this.shipType = shipType;
    this.weaponType = weaponType;

    // Size and anchoring
    this.anchor.setTo(0.5, 0.5);

    // Health
    this.health = 20;
    this.maxHealth = this.health;
    // tslint:disable-next-line:no-unused-expression
    // new HealthBar(this);

    // Weapon
    const baseFiringRate = 10000;
    this.weapon = new Weapon(this, this.bulletDamage, weaponType);
    const fireTimer = this.game.time.create();
    fireTimer.loop(baseFiringRate + baseFiringRate * Math.random(), () =>
      this.fire(),
    );
    fireTimer.start();

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

  public getHurtTint() {
    this.tint = 0xff0000;
    window.setTimeout(() => (this.tint = 0xffffff), 150);
  }

  public explode() {
    const explosion = this.game.add.sprite(this.x, this.y, 'explosion');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.animations.add('explosion');
    explosion.play('explosion', 30, false, true);
    this.explosionFx.play();
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
    this.weapon.fire();
  }
}
