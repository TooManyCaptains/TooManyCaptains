import { Color } from './../../../common/types';
import { Game } from '../index';
import { Enemy } from './Enemy';
import { colorNameToLetter } from '../utils';
import Player from './Player';

const toDegrees = (radians: number) => radians * 180 / Math.PI;

export class EnemyBullet extends Phaser.Sprite {
  public strength: number;
  public color: Color;

  constructor(game: Game) {
    super(game, 0, 0);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.scale.set(1.5, 1.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.setSize(28, 3.5, 15.5, 15.5);
  }

  public fire(
    x: number,
    y: number,
    angle: number,
    speed: number,
    strength: number,
    color: Color,
  ) {
    this.color = color;
    this.loadTexture(`enemy_bullet_${colorNameToLetter(color)}`);
    this.reset(x, y);
    this.strength = strength;
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
  private player: Player;

  constructor(game: Game, player: Player) {
    super(game, game.world, 'Enemy Weapon', false, true, Phaser.Physics.ARCADE);

    this.player = player;

    for (let i = 0; i < 256; i++) {
      this.add(new EnemyBullet(game), true);
    }
  }

  public fire(enemy: Enemy) {
    const x = enemy.x - enemy.width / 2;
    const y = enemy.y;

    const angleToPlayer = toDegrees(
      this.game.physics.arcade.angleToXY(this.player, x, y),
    );
    const enemyBullet = this.getFirstExists(false) as EnemyBullet;
    enemyBullet.color = enemy.weaponColor;
    enemyBullet.fire(
      x,
      y,
      angleToPlayer,
      enemy.bulletVelocity,
      enemy.bulletStrength,
      enemy.weaponColor,
    );
  }
}
