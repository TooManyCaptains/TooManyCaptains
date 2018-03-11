import { Game } from '../index';
import { baseStyle } from './Styles';
import { range } from 'lodash';
import { GameCaptain } from '../types';

class BlinkingButtonLabel extends Phaser.Group {
  constructor(game: Game, x: number, y: number, actionText: string = '') {
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
    const blinkDurationMillis = 1000;
    const blinkTimer = this.game.time.create(true);
    blinkTimer.loop(blinkDurationMillis, this.blink, this);
    blinkTimer.start();
  }

  public blink() {
    // this.alpha = this.alpha === 0 ? 1 : 0;
  }
}

// This class can create labels that blink at a frequency
// specified by `blinkDuration`. For a labal that does NOT,
// set blinkDuration to 0.
class BlinkingLabel extends Phaser.Group {
  constructor(
    game: Game,
    x: number,
    y: number,
    textString: string,
    blinkDuration: number = 1250,
  ) {
    super(game);

    const color = 0x32fc39;
    const text = this.game.add.text(x, y, textString, {
      ...baseStyle,
      fill: `#${color.toString(16)}`,
      fontSize: 110,
      fontWeight: 900,
    });
    text.anchor.setTo(0.5, 0.5);
    this.add(text);

    const box = game.add.graphics();
    const boxPadding = 50;
    box.lineStyle(4, color, 1);
    box.beginFill(0, 0);
    box.drawRoundedRect(
      text.left - boxPadding,
      text.top - boxPadding / 2,
      text.width + boxPadding * 2,
      text.height + boxPadding,
      20,
    );
    this.add(box);

    // Blinking
    if (blinkDuration !== 0) {
      const blinkTimer = this.game.time.create(true);
      blinkTimer.loop(blinkDuration, this.blink, this);
      blinkTimer.start();
    }
  }

  public blink() {
    this.alpha = this.alpha === 0 ? 1 : 0;
  }
}

export class StartScreen extends Phaser.Group {
  public game: Game;
  private cards: Phaser.Sprite[];
  private addedCaptains: GameCaptain[] = [];
  private scanCardLabel: BlinkingLabel;
  private startLabel: BlinkingButtonLabel;
  private captainJoinedFx: Phaser.Sound;

  constructor(game: Game) {
    super(game);

    // // Title
    // const title = this.create(
    //   this.game.world.centerX,
    //   this.game.height - 200,
    //   'title',
    // );
    // title.anchor.setTo(0.5, 0.5);

    const paddingBetweenEachCard = 25;
    const numCards = 7;
    let initialX = 0;

    this.cards = range(numCards).map(i => {
      const card = new Phaser.Sprite(game, 0, 0, `id_card_${i}`);
      card.animations.add('flip', range(31), 30, false);

      if (i === 0) {
        card.x =
          paddingBetweenEachCard / 2 +
          (game.width - (card.width + paddingBetweenEachCard) * numCards) / 2;
        initialX = card.x;
      } else {
        card.x = initialX + (card.width + paddingBetweenEachCard) * i;
      }
      card.y = this.game.world.centerY + 100;
      card.anchor.setTo(0, 0.5);
      this.add(card);
      return card;
    });

    (window as any).flipCard = (i: number) => {
      this.cards[i].animations.play('flip');
    };

    this.captainJoinedFx = this.game.add.audio('scan_success');

    const labelTopMargin = 250;
    // Label
    this.scanCardLabel = new BlinkingLabel(
      game,
      this.game.world.centerX,
      labelTopMargin,
      'SCAN ID CARD TO BOARD SHIP',
      0,
    );

    this.add(this.scanCardLabel);

    const blinkTimer = this.game.time.create(true);
    blinkTimer.loop(50, this.checkForNewCaptains, this);
    blinkTimer.start();
  }

  private checkForNewCaptains() {
    if (this.addedCaptains.length !== this.game.captains.length) {
      this.game.captains.forEach(captain => {
        if (!this.addedCaptains.includes(captain)) {
          this.addedCaptains.push(captain);
          this.onCaptainJoined(captain);
        }
      });
    }
  }

  private onCaptainJoined(captain: GameCaptain) {

    // Play a sound
    this.captainJoinedFx.play();

    // Flip over the captain's card
    this.cards[captain.cardID].animations.play('flip');

    // If more than 2 captains, show instructions to start game
    if (this.addedCaptains.length >= 2) {
      this.scanCardLabel.destroy();
      // We need to create the button here so that the blink
      // time begins when it first added to the group.
      if (!this.startLabel) {
        this.startLabel = new BlinkingButtonLabel(
          this.game,
          this.game.world.centerX,
          250
        );
        this.add(this.startLabel);
      }
    }
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
