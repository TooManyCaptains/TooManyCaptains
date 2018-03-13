import { Color } from './../../../common/types';
import { Game } from '../index';
import Player from './Player';
import { colorNameToLetter } from '../utils';

export class PlayerWeaponBullet extends Phaser.Sprite {
  public color: Color;
  public strength = 0;

  constructor(game: Game, color: Color) {
    super(game, 0, 0, `player_bullet_${colorNameToLetter(color)}`);
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
  public player: Player;
  public nextFire = 0;
  public bulletVelocity = 400;
  public fireRate = 500;
  public color: Color;

  constructor(player: Player, color: Color) {
    super(
      player.game,
      player.game.world,
      'Player Bullet',
      false,
      true,
      Phaser.Physics.ARCADE,
    );
    this.player = player;
    this.bulletVelocity = this.bulletVelocity;
    for (let i = 0; i < 64; i++) {
      this.add(new PlayerWeaponBullet(this.game, color), true);
    }
  }

  public fire(strength: number, canon: number) {
    console.info(`firing with strength: ${strength}`);
    const x = [
      this.player.ship.x + this.player.ship.width / 2 - 48,
      this.player.ship.x + this.player.ship.width / 2,
      this.player.ship.x + this.player.ship.width / 2 - 48,
    ];
    const y = [this.player.ship.y - 33.5, this.player.ship.y, this.player.ship.y + 33.5];
    this.getFirstExists(false).fire(
      x[canon],
      y[canon],
      this.bulletVelocity,
      strength,
    );
  }
}
