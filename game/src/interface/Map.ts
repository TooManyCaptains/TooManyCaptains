import { Game } from '../index';

const MIN_X = 50;
const MAX_X = 1870;

export default class Map extends Phaser.Group {
  public game: Game;
  public miniMap: Phaser.Sprite;
  public iconPlayer: Phaser.Sprite;
  public iconBoss: Phaser.Sprite;

  constructor(game: Game) {
    super(game);

    // Sprites
    this.miniMap = new Phaser.Sprite(this.game, 0, 0, 'map');
    this.iconPlayer = new Phaser.Sprite(this.game, MIN_X, 0, 'map-icon-player');
    this.iconPlayer.anchor.setTo(0.5, 0);
    this.iconPlayer.scale.setTo(0.75, 0.75);

    this.add(this.miniMap);
    this.add(this.iconPlayer);

    const tween = this.game.add.tween(this.iconPlayer);
    tween.to(
      { x: MAX_X },
      this.game.session.totalTimeToBoss,
      Phaser.Easing.Linear.None,
      true,
    );
  }
}
