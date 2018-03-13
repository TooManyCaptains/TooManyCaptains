import { StartScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';

export default class Before extends Phaser.State {
  public game: Game;

  public preload() {
    this.load.spritesheet(
      'id_card_0',
      'assets/sprites/id_card_0_240x600.png',
      240,
      600,
    );

    this.load.spritesheet(
      'id_card_1',
      'assets/sprites/id_card_1_240x600.png',
      240,
      600,
    );

    this.load.spritesheet(
      'id_card_2',
      'assets/sprites/id_card_2_240x600.png',
      240,
      600,
    );

    this.load.spritesheet(
      'id_card_3',
      'assets/sprites/id_card_3_240x600.png',
      240,
      600,
    );

    this.load.spritesheet(
      'id_card_4',
      'assets/sprites/id_card_4_240x600.png',
      240,
      600,
    );

    this.load.spritesheet(
      'id_card_5',
      'assets/sprites/id_card_5_240x600.png',
      240,
      600,
    );

    this.load.spritesheet(
      'id_card_6',
      'assets/sprites/id_card_6_240x600.png',
      240,
      600,
    );
  }

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.add.existing(new StartScreen(this.game));

    this.game.session.reset();
    this.game.add
      .audio('music_background')
      .play(undefined, undefined, undefined, true);

    this.game.session.onFire.add(() => {
      if (this.canStart) {
        this.state.start('Main');
      }
    });
  }

  private canStart(): boolean {
    return (
      this.game.session.cards.length >= 3 && this.game.session.cards.includes(0)
    );
  }
}
