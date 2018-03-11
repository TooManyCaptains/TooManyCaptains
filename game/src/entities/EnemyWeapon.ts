import { Color } from './../../../common/types';
import { Game } from '../index';
import { Enemy } from './Enemy';
import { colorNameToLetter } from '../utils';

const toDegrees = (radians: number) => radians * 180 / Math.PI;

export class EnemyBullet extends Phaser.Sprite {
  private _color: Color;

  constructor(game: Game, color?: Color) {
    super(game, 0, 0);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.scale.set(1.5, 1.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(28, 3.5, 15.5, 15.5);
    if (color) {
      this.color = color;
    }
  }

  set color(newColor: Color) {
    this._color = newColor;
    this.loadTexture(`enemy_bullet_${colorNameToLetter(newColor)}`);
  }

  get color() {
    return this._color;
  }

  public fire(x: number, y: number, angle: number, speed: number) {
    this.reset(x, y);
    this.angle = angle;
    this.game.physics.arcade.velocityFromAngle(
      angle,
      speed,
      this.body.velocity,
    );
  }
}

export class EnemyBulletPool extends Phaser.Group {
  public game: Game;
  public color: Color;
  public damage = 10;

  private bulletVelocity = -200;

  constructor(game: Game) {
    super(game, game.world, 'Enemy Bullet', false, true, Phaser.Physics.ARCADE);

    for (let i = 0; i < 256; i++) {
      this.add(new EnemyBullet(game), true);
    }
  }

  public fire(game: Game, ship: Enemy): boolean {
    const x = ship.x - ship.width / 2;
    const y = ship.y;

    const angleToPlayer = toDegrees(
      game.physics.arcade.angleToXY(game.player, x, y),
    );
    const beam = this.getFirstExists(false);
    beam.color = ship.weaponColor;
    beam.fire(x, y, angleToPlayer, this.bulletVelocity, 0, 600);
    return true;
  }
}
