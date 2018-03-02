import PlayerShip from './PlayerShip';

// XXX: This code should be merged
// with the healthbar in HUD.ts. It should also
// probably be rewritten to use a group instead
// of adding things to the game directly.
export default class PlayerHealthBar {
  private height = 15;
  private width: number;
  private ship: PlayerShip;
  private bar: Phaser.Graphics;
  private barMask: Phaser.Graphics;
  private background: Phaser.Graphics;

  constructor(ship: PlayerShip, color = 0x30ee02) {
    const game = ship.game;
    this.ship = ship;
    this.width = this.ship.width * 0.65;

    this.background = game.add.graphics();
    this.background.beginFill(0x999999, 1);
    this.background.drawRoundedRect(0, 0, this.width, this.height, 25);

    this.bar = game.add.graphics();
    this.bar.beginFill(color, 1);

    this.barMask = game.add.graphics();
    this.bar.mask = this.barMask;

    this.bar.update = this.update.bind(this);
    this.color = color;
  }

  set color(color: number) {
    this.bar.clear();
    this.bar.beginFill(color, 1);
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 25);
    this.barMask.clear();
    this.barMask.beginFill(color, 1);
    this.barMask.drawRect(0, 0, this.width, this.height);
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
    this.barMask.x = x;
    this.barMask.y = y;
    this.background.x = x;
    this.background.y = y;
    this.barMask.scale.x = Math.max(0, this.ship.health / this.ship.maxHealth);
  }
}
