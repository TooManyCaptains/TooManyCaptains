import { Color } from './../../../common/types';
import { Game } from '../index';
import PlayerShip from './Player';
import { colorNameToLetter } from '../utils';

export class PlayerWeaponBullet extends Phaser.Sprite {
  public color: Color;

  constructor(game: Game, color: Color) {
    super(game, 0, 0, `player_bullet_${colorNameToLetter(color)}`);
    this.color = color;
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(15, 15, 40, 5);
  }

  public fire(x: number, y: number, speed: number) {
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
  public nextFire = 0;
  public bulletVelocity = 400;
  public fireRate = 500;

  constructor(private playerShip: PlayerShip, public color: Color) {
    super(
      playerShip.game,
      playerShip.game.world,
      'Player Bullet',
      false,
      true,
      Phaser.Physics.ARCADE,
    );
    this.color = color;
    this.bulletVelocity = this.bulletVelocity;
    for (let i = 0; i < 64; i++) {
      this.add(new PlayerWeaponBullet(this.game, color), true);
    }
  }

  public fire(strength: number, canon: number) {
    const x = [
      this.playerShip.x + this.playerShip.width / 2 - 48,
      this.playerShip.x + this.playerShip.width / 2,
      this.playerShip.x + this.playerShip.width / 2 - 48,
    ];
    const y = [
      this.playerShip.y - 33.5,
      this.playerShip.y,
      this.playerShip.y + 33.5,
    ];
    const bullet = this.getFirstExists(false);
    bullet.color = this.color;
    bullet.fire(x[canon], y[canon], this.bulletVelocity, strength);
  }
}
