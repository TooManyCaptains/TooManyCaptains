import { Game } from '../index';
import { baseStyle } from './Styles';
import { range } from 'lodash';

class BlinkingButtonLabel extends Phaser.Group {
  constructor(game: Game, x: number, y: number, actionText: string) {
    super(game);

    const buttonOffset = 80;
    const text = this.game.add.text(x, y, `PRESS          TO ${actionText}`, {
      ...baseStyle,
      fontSize: 110,
      fontWeight: 900,
    });
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

    // Title
    const title = this.create(
      this.game.world.centerX,
      this.game.height - 200,
      'title',
    );
    title.anchor.setTo(0.5, 0.5);

    const paddingBetweenEachCard = 25;
    const numCards = 7;
    let initialX = 0;
    range(numCards).map(i => {
      // const card = new Phaser.Sprite(game, 0, 0, `id_card_${i}`);
      const card = new Phaser.Sprite(game, 0, 0, 'id_card_0');
      card.animations.add('flip', range(29), 30, false);
      card.animations.play('flip');

      if (i === 0) {
        card.x =
          paddingBetweenEachCard / 2 +
          (game.width - (card.width + paddingBetweenEachCard) * numCards) / 2;
        initialX = card.x;
      } else {
        card.x = initialX + (card.width + paddingBetweenEachCard) * i;
      }
      card.y = this.game.world.centerY - 50;
      card.anchor.setTo(0, 0.5);
      this.add(card);
    });

    // Label
    // const x = this.game.world.centerX;
    // const y = this.game.world.centerY + logo.height * 0.8;
    // this.add(new BlinkingButtonLabel(game, x, y, 'START'));
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
    const text = this.game.add.text(x, y, `SCORE: ${this.game.score}`, {
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
