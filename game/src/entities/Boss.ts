import { Game } from '../index';
// import HealthBar from './HealthBar';

export default class Boss extends Phaser.Group {
  public game: Game;
  public ship: Phaser.Sprite;
  // public weapon: PlayerWeapon;

  // private healthBar: HealthBar;
  // private shootFx: Phaser.Sound;

  constructor(game: Game, x: number, y: number) {
    super(game);
    this.ship = new Phaser.Sprite(this.game, x, y, 'boss-ship');
    this.add(this.ship);
    this.ship.scale.setTo(0.5, 0.5);
  }
}
