import { Game } from '../index';
import { range } from 'lodash';
import { CardID } from '../../../common/types';
import { baseStyle, ColorPalette } from './Styles';
import manifest from '../../../common/manifest';

const CAPTAINS_NEEDED_TO_START = 2;

class Placeholder extends Phaser.Graphics {
  constructor(lobby: Lobby, color: number) {
    super(lobby.game, 0, 0);

    this.beginFill(color, 0.3);
    const radius = 20;
    this.drawRoundedRect(radius / 2, 0, 260 - radius, 380, radius);
  }
}

class Card extends Phaser.Group {
  public game: Game;
  public isFlipped = false;
  public card: Phaser.Sprite;

  constructor(lobby: Lobby) {
    super(lobby.game, lobby);

    this.card = this.game.add.sprite(0, 0, 'id-card-razzmic', null, this);
    this.card.animations.add('flip', range(61), 120, false);
    this.card.anchor.setTo(0, 0.5);
    this.card.y = this.game.height;
  }

  get width() {
    return this.card.width;
  }

  get height() {
    return this.card.height;
  }

  public flipAs(
    cardID: CardID,
    onSlideComplete?: () => void,
    onFlipComplete?: () => void,
  ) {
    this.game.world.bringToTop(this);
    this.isFlipped = true;
    // Set card identity
    const entry = manifest.find(m => m.cardID === cardID);
    if (!entry) {
      throw new Error(
        `card with ID ${cardID} not found in manifest! Skipping.`,
      );
    }
    const firstName = entry.name.split(' ')[0].toLowerCase();
    this.card.loadTexture(`id-card-${firstName}`);

    this.game.add
      .tween(this.card)
      .to({ y: 0 }, 1200, Phaser.Easing.Cubic.InOut, true)
      .onComplete.addOnce(() => {
        const animation = this.card.animations.play('flip');
        if (onSlideComplete) {
          onSlideComplete();
        }
        if (onFlipComplete) {
          animation.onComplete.addOnce(onFlipComplete);
        }
      });
  }
}

class Instruction extends Phaser.Group {
  public game: Game;

  private image: Phaser.Sprite;
  private title: Phaser.Text;
  private titleBackground: Phaser.Graphics;
  private subtitle: Phaser.Text;

  constructor(
    lobby: Lobby,
    imageKey: string,
    color = 0xff0ff,
    title = 'TITLE',
    subtitle = 'SUBTITLE',
  ) {
    super(lobby.game, lobby);
    // Instruction graphic
    this.image = this.game.add.sprite(
      this.game.world.centerX - 250,
      this.game.world.centerY - 150,
      imageKey,
      null,
      this,
    );
    this.image.anchor.setTo(0.5, 0.5);
    const mask = this.game.add.graphics(0, 0, this);
    mask.drawRoundedRect(
      this.image.x - this.image.width / 2,
      this.image.y - this.image.height / 2,
      this.image.width,
      this.image.height,
      15,
    );
    this.image.mask = mask;

    const radius = 15;
    const fontSize = 60;
    const topPadding = 50;
    const leftPadding = 50;
    this.titleBackground = this.game.add.graphics(0, 0, this);
    this.title = this.game.add.text(
      this.image.right + leftPadding + radius,
      this.image.top + topPadding,
      title,
      {
        ...baseStyle,
        fill: 'black',
        fontSize,
      },
      this,
    );
    this.titleBackground.beginFill(color);
    this.titleBackground.drawRoundedRect(
      this.image.right + leftPadding,
      this.image.top + topPadding,
      this.title.right - this.title.left + radius * 2,
      fontSize + radius,
      15,
    );

    this.subtitle = this.game.add.text(
      this.image.right + leftPadding,
      this.title.bottom + 15,
      subtitle,
      {
        ...baseStyle,
        fontWeight: 600,
        fontSize,
        fill: Phaser.Color.getWebRGB(color),
      },
      this,
    );
    this.subtitle.wordWrapWidth = 475;
    this.subtitle.wordWrap = true;
  }

  public shrink(fraction: number) {
    this.game.add.tween(this.scale).to(
      {
        x: this.scale.x * fraction,
        y: this.scale.y * fraction,
      },
      500,
      Phaser.Easing.Quadratic.InOut,
      true,
    );
  }
}

export default class Lobby extends Phaser.Group {
  public game: Game;

  private cards: Card[] = [];
  private placeholders: Placeholder[] = [];
  private instruction: Instruction;
  private rightInstruction: Instruction;
  private instructionsSplit = false;

  constructor(game: Game) {
    super(game);

    this.instruction = new Instruction(
      this,
      'instruction-0',
      ColorPalette.Yellow,
      'STEP 1',
      'SCAN ENGINEER CARD',
    );

    // High score text
    const highScoreTextPadding = 25;
    const highScoreText = this.game.add.text(
      0,
      highScoreTextPadding / 2,
      `HIGH SCORE: ${this.game.session.highScore}`,
      { ...baseStyle, fontSize: 50, stroke: 'black', strokeThickness: 10 },
      this,
    );
    highScoreText.x =
      this.game.width - highScoreText.width - highScoreTextPadding;

    // Cards and placeholders
    const paddingBetweenEachCard = 5;
    const numCards = 7;
    let initialX = 0;
    range(numCards).forEach(i => {
      let x = 0;
      const y = this.game.world.centerY + 325;

      // Create card
      const card = new Card(this);

      // Calculate position
      if (i === 0) {
        x =
          paddingBetweenEachCard / 2 +
          (game.width - (card.width + paddingBetweenEachCard) * numCards) / 2;
        initialX = x;
      } else {
        x = initialX + (card.width + paddingBetweenEachCard) * i;
      }

      // Placeholder
      let placeHolder: Placeholder;
      if (i === 0) {
        placeHolder = new Placeholder(this, ColorPalette.Yellow);
      } else if (i <= 2) {
        placeHolder = new Placeholder(this, ColorPalette.Blue);
      } else {
        placeHolder = new Placeholder(this, ColorPalette.Gray);
      }
      placeHolder.x = x;
      placeHolder.y = y - 190;
      this.placeholders.push(placeHolder);

      // Set card position and draw on top of placeholder
      card.x = x;
      card.y = y;
      this.cards.push(card);
      this.add(placeHolder, undefined, 0);
    });

    this.game.session.signals.cards.add(this.onCaptainJoined, this);
  }

  private updateInstructions() {
    if (
      this.game.session.cards.has(0) &&
      this.game.session.captainsInRound.size < CAPTAINS_NEEDED_TO_START
    ) {
      this.instruction.destroy();
      this.instruction = new Instruction(
        this,
        'instruction-1',
        ColorPalette.Blue,
        'STEP 2',
        'SCAN CAPTAIN CARD',
      );
    } else if (this.game.session.canStartRound) {
      if (this.instructionsSplit) {
        if (this.game.session.captainsInRound.size === 6) {
          this.game.add
            .tween(this.instruction)
            .to({ alpha: 0 }, 500, Phaser.Easing.Quadratic.InOut, true);
          this.game.add
            .tween(this.rightInstruction)
            .to({ x: 90 }, 500, Phaser.Easing.Quadratic.InOut, true);
        }
      } else {
        this.instructionsSplit = true;
        // Create new instructions
        this.instruction.destroy();
        this.instruction = new Instruction(
          this,
          'instruction-1',
          ColorPalette.Blue,
          'ADD',
          'CONTINUE SCANNING TO ADD CAPTAINS',
        );
        this.rightInstruction = new Instruction(
          this,
          'instruction-2',
          0xf2202d,
          'START',
          'PRESS RED BUTTON TO START GAME',
        );
        this.rightInstruction.alpha = 0;

        // Scale (and alpha for right instruction)
        this.game.add
          .tween(this.rightInstruction)
          .to(
            { x: 650, y: 50, alpha: 1 },
            500,
            Phaser.Easing.Quadratic.InOut,
            true,
          );
        this.game.add
          .tween(this.instruction)
          .to({ x: -350, y: 50 }, 500, Phaser.Easing.Quadratic.InOut, true);

        // Shrink
        this.instruction.shrink(0.9);
        this.rightInstruction.shrink(0.9);
      }
    }
  }

  private onCaptainJoined(cardID: CardID) {
    // Play sound
    this.game.sound.add('scan_success').play();

    // Flip over the captain's card
    const card = this.cards.find(c => c.isFlipped === false);
    if (card) {
      const index = this.cards.indexOf(card);
      const onSlideComplete = () => {
        this.placeholders[index].visible = false;
      };
      const onFlipComplete = () => {
        this.updateInstructions();
        // XXX: Hack! Without this, frame rate drops to 1fps.
        // Seems to be related to changing the y-position of the card.
        if (index === 0) {
          card.card.loadTexture('id-card-spectra-static');
        }
      };
      card.flipAs(cardID, onSlideComplete, onFlipComplete);
    } else {
      console.error('too many captains!');
    }
  }
}
