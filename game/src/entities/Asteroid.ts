import { Game } from '../index';

export default class Asteroid extends Phaser.Sprite {
  public collisionDamage = 35;
  public game: Game;
  private movementSpeed = 90;

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 'asteroid');

    // Physics and movement
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.outOfBoundsKill = true;
    this.checkWorldBounds = true;
    this.body.velocity.x =
      -this.movementSpeed + this.movementSpeed * (Math.random() / 5);

    const randScale = 1 + Math.random() / 2;

    const scale = 0.6 * randScale;
    this.scale.set(scale, scale);

    this.body.setSize(140, 145, 33.5, 30);
    this.sendToBack();
    this.body.angularVelocity = -30;
  }

  public kill(): Phaser.Sprite {
    this.game.score += 250;
    super.kill();
    return this;
  }
}
