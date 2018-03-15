import { Game } from '../index';

export default class Map extends Phaser.Group {
  public game: Game;
  public miniMap: Phaser.Sprite;
  public iconPlayer: Phaser.Sprite;
  public iconBoss: Phaser.Sprite;
  

  constructor(game: Game) {
    super(game);

    // Sprites
    this.miniMap = this.create(0, 0, 'map');
    this.iconPlayer = this.create(100, 0, 'map-icon-player');
    this.iconPlayer.anchor.setTo(0.5, 0);

    console.log('hi', this.game.time.time);

  }

  public update() {
      this.iconPlayer.x += 0.05;
  }
  
  

}