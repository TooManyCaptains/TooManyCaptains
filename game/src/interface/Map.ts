import { Game } from '../index';
import { baseStyle, ColorPalette } from './Styles';

const MIN_X = 50;
const MAX_X = 1870;

class ScoreBubble extends Phaser.Group {
  public game: Game;
  private text: Phaser.Text;
  private background: Phaser.Graphics;

  constructor(game: Game) {
    super(game);
    this.text = this.game.add.text(20, 4, '', {
      ...baseStyle,
      fontSize: 32,
    });
    this.text.align = 'left';

    this.background = game.add.graphics();

    this.add(this.background);
    this.add(this.text);

    this.game.session.signals.score.add(this.onScoreChanged, this);

    this.onScoreChanged();
  }

  private onScoreChanged() {
    this.background.clear();
    this.background.beginFill(ColorPalette.Black, 0.7);
    this.background.drawRoundedRect(
      0,
      0,
      165 + 15 * String(this.game.session.score).length,
      50,
      25,
    );
    this.background.lineStyle(2, ColorPalette.White, 1);
    this.background.drawRoundedRect(
      0,
      0,
      165 + 15 * String(this.game.session.score).length,
      50,
      25,
    );
    this.score = this.game.session.score;
  }

  set score(score: number) {
    this.text.text = `SCORE: ${score}`;
  }
}

export default class Map extends Phaser.Group {
  public game: Game;
  private miniMap: Phaser.Sprite;
  private scoreBubble: ScoreBubble;
  private iconPlayer: Phaser.Sprite;
  // private iconBoss: Phaser.Sprite;

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

    // Unfortunately, this tween will not be perfectly smooth, since we are
    // tweening text and it will align to pixels, rather than draw on subpixels
    // it seems. Even rolling our own linear interpolation by overriding
    // update() doesn't fix it :/
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
