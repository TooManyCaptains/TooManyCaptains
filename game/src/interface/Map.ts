import { Game } from '../index';

export default class Map extends Phaser.Group {
  public game: Game;

  private miniMap: Phaser.Sprite;
  private iconPlayer: Phaser.Sprite;
  // private iconBoss: Phaser.Sprite;

  constructor(game: Game) {
    super(game);

    // Sprites
    this.miniMap = new Phaser.Sprite(this.game, 0, 0, 'map');
    this.iconPlayer = new Phaser.Sprite(this.game, 100, 0, 'map-icon-player');
    this.iconPlayer.anchor.setTo(0.5, 0);

    this.add(this.miniMap);
    this.add(this.iconPlayer);
  }
}
