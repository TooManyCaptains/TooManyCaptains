import { Game } from '../index';
import { baseStyle } from './Styles';

const MIN_X = 50;
const MAX_X = 1870;

class ScoreBubble extends Phaser.Group {
  public game: Game;
  private text: Phaser.Text;
  private background: Phaser.Graphics;

  constructor(game: Game) {
    super(game);
    this.text = this.game.add.text(15, 0, '', {
      ...baseStyle,
      fontSize: 32,
      fill: 'black',
    });
    this.text.align = 'left';

    this.background = game.add.graphics();
    this.background.beginFill(0xffffff, 1);
    this.background.drawRoundedRect(0, 0, 200, 44, 15);

    this.add(this.background);
    this.add(this.text);

    this.game.session.signals.score.add(this.onScoreChanged, this);

    this.onScoreChanged();
  }

  private onScoreChanged() {
    this.score = this.game.session.score;
  }

  set score(score: number) {
    this.text.text = `SCORE: ${score}`;
  }
}

export default class Map extends Phaser.Group {
  public game: Game;
  public miniMap: Phaser.Sprite;
  public scoreBubble: ScoreBubble;
  public iconPlayer: Phaser.Sprite;
  public iconBoss: Phaser.Sprite;

  constructor(game: Game) {
    super(game);

    // Sprites
    this.miniMap = new Phaser.Sprite(this.game, 0, 0, 'map');
    this.iconPlayer = new Phaser.Sprite(this.game, MIN_X, 0, 'map-icon-player');
    this.iconPlayer.anchor.setTo(0.5, 0);
    this.iconPlayer.scale.setTo(0.75, 0.75);
    this.scoreBubble = new ScoreBubble(this.game);
    this.scoreBubble.y = 25;
    this.scoreBubble.x = 100;

    this.add(this.miniMap);
    this.add(this.iconPlayer);
    this.add(this.scoreBubble);

    this.game.add
      .tween(this.iconPlayer)
      .to(
        { x: MAX_X },
        this.game.session.totalTimeToBoss,
        Phaser.Easing.Linear.None,
        true,
      );

    this.game.add
      .tween(this.scoreBubble)
      .to(
        { x: MAX_X },
        this.game.session.totalTimeToBoss,
        Phaser.Easing.Linear.None,
        true,
      );
  }
}
