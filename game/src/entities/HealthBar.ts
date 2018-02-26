import PlayerShip from './PlayerShip';
import { Enemy } from './Enemy';

export default class HealthBar {
  private height = 15;
  private width: number;
  private ship: PlayerShip | Enemy;
  private outline: Phaser.Graphics;
  private bar: Phaser.Graphics;

  constructor(ship: PlayerShip | Enemy, color = 0x30ee02) {
    this.ship = ship;
    // this.width = 140;
    this.width = this.ship.width * 0.5;

    if (this.ship.key === 'player-ship') {
      this.height *= 1.3;
      this.width *= 1.3;
    }

    this.outline = ship.game.add.graphics();
    this.outline.beginFill(0xffffff, 1);
    this.outline.drawRoundedRect(0, 0, this.width, this.height, 50);

    this.bar = ship.game.add.graphics();
    this.bar.beginFill(color, 1);
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 50);
    this.bar.update = this.update.bind(this);
  }

  public update() {
    let x = this.ship.centerX - this.width * 0.7;
    let y = this.ship.y - this.ship.height * 0.85;
    if (this.ship.key === 'player-ship') {
      x = this.ship.centerX - this.width * 0.5;
      y = this.ship.y - this.ship.height * 0.7;
    }
    this.bar.x = x;
    this.bar.y = y;
    this.outline.x = x;
    this.outline.y = y;
    this.bar.scale.x = Math.max(0, this.ship.health / this.ship.maxHealth);
    if (!this.ship.alive) {
      this.bar.destroy();
      this.outline.destroy();
    }
  }
}
