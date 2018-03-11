import { Color } from './../../../common/types';
import { Game } from '../index';
import PlayerShip from './PlayerShip';
import { colorNameToLetter } from '../utils';

export class PlayerWeaponBullet extends Phaser.Sprite {
  public color: string;
  public strength = 0;

  constructor(game: Game, key: string) {
    super(game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(15, 15, 40, 5);
  }

  public fire(x: number, y: number, speed: number, strength: number) {
    this.reset(x, y);
    this.angle = 0;
    this.game.physics.arcade.velocityFromAngle(
      this.angle,
      speed,
      this.body.velocity,
    );
  }
}

export class PlayerWeapon extends Phaser.Group {
  public game: Game;
  public ship: PlayerShip;
  public nextFire = 0;
  public bulletVelocity = 400;
  public fireRate = 500;
  public color: Color;
  public colorType: string;

  constructor(ship: PlayerShip, color: Color) {
    super(
      ship.game,
      ship.game.world,
      'Player Bullet',
      false,
      true,
      Phaser.Physics.ARCADE,
    );
    this.ship = ship;
    this.colorType = colorNameToLetter(color);
    this.bulletVelocity = this.bulletVelocity;
    for (let i = 0; i < 64; i++) {
      const bullet = new PlayerWeaponBullet(this.game, `player_bullet_${this.colorType}`);
      bullet.color = color;
      this.add(bullet, true);
    }
  }

  public fire(strength: number, canon: number) {
    console.info(`firing with strength: ${strength}`);
    const x = [
      this.ship.x + this.ship.width / 2 - 48,
      this.ship.x + this.ship.width / 2,
      this.ship.x + this.ship.width / 2 - 48,
    ];
    const y = [this.ship.y - 33.5, this.ship.y, this.ship.y + 33.5];
    this.getFirstExists(false).fire(
      x[canon],
      y[canon],
      this.bulletVelocity,
      strength,
    );
  }
}
