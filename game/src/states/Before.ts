import Doors from '../interface/Doors';
import { Game } from '../index';
import Lobby from '../interface/Lobby';
import Marquee from '../interface/Marquee';

export default class Before extends Phaser.State {
  public game: Game;

  private doors: Doors;
  private lobby: Lobby;
  private marquee: Marquee;

  public create() {
    this.doors = new Doors(this.game);
    this.doors.alpha = 0.7;
    this.game.add.existing(this.doors);

    this.lobby = new Lobby(this.game);
    this.game.add.existing(this.lobby);

    this.marquee = new Marquee(
      this.game,
      this.game.world.centerX,
      0,
      'icon-high-score-green',
    );
    this.marquee.message = `HIGH SCORE: ${this.game.session.highScore}`;
    this.game.add.existing(this.marquee);

    this.game.session.reset();

    this.game.session.signals.fire.add(this.onFire, this);
  }

  private onFire() {
    if (this.game.session.canStartRound) {
      // Fade out lobby
      this.game.add
        .tween(this.lobby)
        .to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true);

      // Face in lobby;
      this.game.add
        .tween(this.doors)
        .to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true)
        .onComplete.addOnce(() => {
          this.state.start('Main');
        });
    }
  }
}
