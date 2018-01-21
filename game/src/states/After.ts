import { EndScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';

export default class Boot extends Phaser.State {
  public game: Game;

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.add.existing(new EndScreen(this.game));
    this.game.add.audio('gameover').play();
  }
}
