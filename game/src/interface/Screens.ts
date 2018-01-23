import { Game } from '../index';
import { baseStyle } from './Styles';

class BlinkingButtonLabel extends Phaser.Group {
  constructor(game: Game, x: number, y: number, actionText: string) {
    super(game);

    const buttonOffset = 80;
    const text = this.game.add.text(
      x,
      y,
      `PRESS          TO ${actionText}`,
      {...baseStyle, fontSize: 110, fontWeight: 900},
    );
    text.anchor.setTo(0.5, 0.5);
    const button = this.game.add.sprite(x - buttonOffset, y, 'red-button');
    button.anchor.setTo(0.5, 0.5);
    this.add(text);
    this.add(button);

    // Blinking
    const blinkDurationMillis = 1500;
    const blinkTimer = this.game.time.create(true);
    blinkTimer.loop(blinkDurationMillis, this.blink, this);
    blinkTimer.start();
  }

  public blink() {
    this.visible = this.parent.visible && !this.visible;
  }
}

export class StartScreen extends Phaser.Group {
  constructor(game: Game) {
    super(game);

    // Logo
    const logo = this.create(
      this.game.world.centerX,
      this.game.world.centerY,
      'logo',
    );
    logo.anchor.setTo(0.5, 0.5);
    logo.scale.set(0.75, 0.75);

    // Label
    const x = this.game.world.centerX;
    const y = this.game.world.centerY + logo.height * 0.8;
    this.add(new BlinkingButtonLabel(game, x, y, 'START'));
  }
}

export class EndScreen extends Phaser.Group {
  public game: Game;
  private gameOverText: Phaser.Sprite;

  constructor(game: Game) {
    super(game);

    // Score
    const x = this.game.world.centerX;
    const y = this.game.world.centerY * 0.5;
    const text = this.game.add.text(
      x,
      y,
      `SCORE: ${this.game.score}`,
      {...baseStyle, fontSize: 110},
    );
    text.anchor.setTo(0.5, 0.5);

    // "Game over" text
    this.gameOverText = this.create(
      this.game.world.centerX,
      this.game.world.centerY,
      'gameover-text',
    );
    this.gameOverText.anchor.setTo(0.5, 0.5);

    this.game.time
      .create(true)
      .add(4000, this.addResetInstructions.bind(this))
      .timer.start();
  }

  private addResetInstructions() {
    const x = this.game.world.centerX;
    const y = this.game.world.centerY + this.gameOverText.height * 1.2;
    this.add(new BlinkingButtonLabel(this.game, x, y, 'RESET'));
  }
}
