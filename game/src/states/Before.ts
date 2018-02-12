import { StartScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';

export default class Boot extends Phaser.State {
  public game: Game;

  public preload() {

    this.load.spritesheet(
      'id_card_0',
      'assets/sprites/id_card_0_240x600.png',
      240,
      600
    );
    
  }

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.add.existing(new StartScreen(this.game));
  }
}
