import { Color } from './../../../common/types';
import { Game } from '../index';
import PlayerShip from './Player';
import { colorNameToLetter } from '../utils';

export class PlayerBullet extends Phaser.Sprite {
  public color: Color;

  constructor(game: Game) {
    super(game, 0, 0);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(15, 15, 40, 5);
  }

  public fire(x: number, y: number, speed: number, color: Color) {
    this.color = color;
    this.loadTexture(`player_bullet_${colorNameToLetter(color)}`);
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

  constructor(private playerShip: PlayerShip) {
    super(
      playerShip.game,
      playerShip.game.world,
      'Player Weapon',
      false,
      true,
      Phaser.Physics.ARCADE,
    );
    this.bulletVelocity = this.bulletVelocity;
    for (let i = 0; i < 64; i++) {
      this.add(new PlayerBullet(this.game), true);
    }
  }

  public fire(strength: number, canon: number, color: Color) {
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
    const bullet = this.getFirstExists(false) as PlayerBullet;
    bullet.fire(x[canon], y[canon], this.bulletVelocity, color);
  }
}
