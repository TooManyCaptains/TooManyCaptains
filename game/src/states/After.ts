import Doors from '../interface/Doors';
import { Game } from '../index';
import Marquee from '../interface/Marquee';
import { baseStyle } from '../interface/Styles';

class ScoreStat extends Phaser.Group {
  constructor(
    public game: Game,
    x: number,
    y: number,
    iconKey: string,
    message: string,
  ) {
    super(game);
    this.x = x;
    this.y = y;
    const icon = this.game.add.sprite(0, 0, iconKey, null, this);
    icon.anchor.setTo(0, 0.5);
    const text = this.game.add.text(
      icon.width + 30,
      0,
      message,
      { ...baseStyle, fontSize: 80, fontWeight: 600 },
      this,
    );
    text.anchor.setTo(0, 0.5);
  }
}

export default class After extends Phaser.State {
  public game: Game;

  private gameOverText: Phaser.Image;
  private marquee: Marquee;
  private secondsBeforeReset = 6;

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.sound.stopAll();
    this.game.add.audio('gameover').play();

    // Marquee
    this.marquee = new Marquee(this.game, this.game.world.centerX, 0);

    // GAME OVER text
    this.gameOverText = this.game.add.image(
      this.game.world.centerX,
      this.game.world.centerY,
      'gameover-text',
    );
    this.gameOverText.anchor.setTo(0.5, 0.5);
    const resetTickTimer = this.game.time.create();
    resetTickTimer.loop(1000, this.onResetTick, this);
    resetTickTimer.start();

    // Score statistics
    const y = 800;
    this.game.add.existing(
      new ScoreStat(
        this.game,
        300,
        y,
        'icon-score',
        `SCORE: ${this.game.session.score}`,
      ),
    );
    this.game.add.existing(
      new ScoreStat(
        this.game,
        950,
        y,
        'icon-high-score',
        `HIGH SCORE: ${this.game.session.highScore}`,
      ),
    );

    this.onResetTick();
  }

  private onResetTick() {
    this.secondsBeforeReset -= 1;
    if (this.secondsBeforeReset === 0) {
      this.state.start('Before');
    }
    this.marquee.message = `GAME WILL RESET IN ${this.secondsBeforeReset}...`;
  }
}
