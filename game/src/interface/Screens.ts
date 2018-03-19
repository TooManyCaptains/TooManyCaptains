import { Game } from '../index';
import { baseStyle } from './Styles';

export class EndScreen extends Phaser.Group {
  public game: Game;
  private gameOverText: Phaser.Sprite;

  constructor(game: Game) {
    super(game);

    // Score
    const x = this.game.world.centerX;
    const y = this.game.world.centerY * 0.5;
    const text = this.game.add.text(x, y, `SCORE: ${this.game.session.score}`, {
      ...baseStyle,
      fontSize: 110,
    });
    text.anchor.setTo(0.5, 0.5);

    // "Game over" text
    this.gameOverText = this.create(
      this.game.world.centerX,
      this.game.world.centerY,
      'gameover-text',
    );
    this.gameOverText.anchor.setTo(0.5, 0.5);

    // this.game.time
    //   .create(true)
    //   .add(4000, this.addResetInstructions.bind(this))
    //   .timer.start();
  }

  // private addResetInstructions() {
  //   const x = this.game.world.centerX;
  //   const y = this.game.world.centerY + this.gameOverText.height * 1.2;
  //   // this.add(new BlinkingButtonLabel(this.game, x, y, 'RESET'));
  // }
}
