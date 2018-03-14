import { Game } from '../index';

export default class Map extends Phaser.Group {
  public game: Game;
  public miniMap: Phaser.Sprite;

  constructor(game: Game) {
    super(game);

    // Sprites
    this.miniMap = this.create(0, 0, 'map');
  }
  
  

}