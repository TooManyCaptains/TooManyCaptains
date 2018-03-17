import { Game } from '../index';

export default class Doors extends Phaser.Group {
  public game: Game;
  private easing = Phaser.Easing.Sinusoidal.InOut;
  private durationMillis: any;
  private rightOpenX: number;
  private leftOpenX: number;
  private doorRight: Phaser.Sprite;
  private doorLeft: Phaser.Sprite;
  private closeFx: Phaser.Sound;
  private openFx: Phaser.Sound;

  constructor(game: Game) {
    super(game);

    const lipSize = 110;
    this.leftOpenX = -this.game.width / 2 - lipSize;
    this.rightOpenX = this.game.width;

    // Sprites
    this.doorLeft = this.create(0, 0, 'door-left');
    this.doorRight = this.create(this.game.width / 2, 0, 'door-right');

    // Sounds
    this.openFx = this.game.add.audio('doors_opening');
    this.closeFx = this.game.add.audio('doors_closing');

    // Animation
    this.durationMillis = 2350;
  }

  public open(callback: () => void) {
    // if (!this.game.params.skip) {
    this.openFx.play();
    // }
    this.game.add
      .tween(this.doorLeft.position)
      .to({ x: this.leftOpenX }, this.durationMillis, this.easing, true);
    const animation = this.game.add
      .tween(this.doorRight.position)
      .to({ x: this.rightOpenX }, this.durationMillis, this.easing, true);
    animation.onComplete.add(callback);
  }

  public close(callback: () => void) {
    this.closeFx.play();
    this.game.add
      .tween(this.doorLeft.position)
      .to({ x: 0 }, this.durationMillis, this.easing, true);
    const animation = this.game.add
      .tween(this.doorRight.position)
      .to({ x: this.game.width / 2 }, this.durationMillis, this.easing, true);
    animation.onComplete.add(callback);
  }
}
