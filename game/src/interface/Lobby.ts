import { Game } from '../index';
import { range } from 'lodash';
import { CardID } from '../../../common/types';
import { baseStyle } from './Styles';
import manifest from '../../../common/manifest';

class Instruction extends Phaser.Group {
  public game: Game;

  private image: Phaser.Sprite;
  private title: Phaser.Text;
  private titleBackground: Phaser.Graphics;
  private subtitle: Phaser.Text;

  constructor(
    game: Phaser.Game,
    imageKey: string,
    color = 0xff0ff,
    title = 'TITLE',
    subtitle = 'SUBTITLE',
  ) {
    super(game);
    // Instruction graphic
    this.image = this.game.add.sprite(
      this.game.world.centerX,
      this.game.world.centerY - 150,
      imageKey,
      null,
      this,
    );
    this.image.anchor.setTo(0.5, 0.5);

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
    this.subtitle.wordWrapWidth = 500;
    this.subtitle.wordWrap = true;
  }
}

export default class Lobby extends Phaser.Group {
  public game: Game;

  private cards: Phaser.Sprite[];
  private captainJoinedFx: Phaser.Sound;
  private instruction: Instruction;

  constructor(game: Game) {
    super(game);

    // Instruction
    // this.instruction = new Instruction(
    //   this.game,
    //   'instruction-0',
    //   ColorPalette.Yellow,
    //   'STEP 1',
    //   'SCAN ENGINEER CARD',
    // );

    // this.instruction = new Instruction(
    //   this.game,
    //   'instruction-1',
    //   ColorPalette.Blue,
    //   'STEP 2',
    //   'SCAN CAPTAIN CARD',
    // );

    this.instruction = new Instruction(
      this.game,
      'instruction-2',
      0xf2202d,
      'START',
      'PRESS RED BUTTON TO START GAME',
    );

    this.instruction.x = this.instruction.x;

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

    // Cards
    const paddingBetweenEachCard = 5;
    const numCards = 7;
    let initialX = 0;
    this.cards = range(numCards).map(i => {
      const entry = manifest.find(m => m.cardID === i);
      if (!entry) {
        throw new Error(`card with ID ${i} not found in manifest! Skipping.`);
      }
      const firstName = entry.name.split(' ')[0].toLowerCase();
      const card = new Phaser.Sprite(game, 0, 0, `id-card-${firstName}`);
      card.animations.add('flip', range(31), 30, false);

      if (i === 0) {
        card.x =
          paddingBetweenEachCard / 2 +
          (game.width - (card.width + paddingBetweenEachCard) * numCards) / 2;
        initialX = card.x;
      } else {
        card.x = initialX + (card.width + paddingBetweenEachCard) * i;
      }
      card.y = this.game.world.centerY + 325;
      card.anchor.setTo(0, 0.5);
      this.add(card);
      return card;
    });

    this.captainJoinedFx = this.game.add.audio('scan_success');

    this.game.session.signals.cards.add(this.onCaptainJoined, this);
  }

  private onCaptainJoined(cardID: CardID) {
    // Play a sound
    this.captainJoinedFx.play();

    // Flip over the captain's card
    this.cards[cardID].animations.play('flip');

    // If more than 2 captains, show instructions to start game
    if (this.game.session.cards.size >= 2) {
      //
    }
  }
}
