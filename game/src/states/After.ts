import { EndScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';

export default class After extends Phaser.State {
  public game: Game;

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.add.existing(new EndScreen(this.game));
    this.game.sound.stopAll();
    this.game.add.audio('gameover').play();
    this.game.session.signals.fire.add(this.onFire, this);
  }

  private onFire() {
    const canRestart = true;
    if (canRestart) {
      this.state.start('Before');
    }
  }
}
