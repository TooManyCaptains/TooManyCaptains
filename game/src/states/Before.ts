import { StartScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';

export default class Boot extends Phaser.State {
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

    // Update gamestate
    this.game.gameState = 'wait_for_players';
  }
}
