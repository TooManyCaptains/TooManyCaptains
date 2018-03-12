import NetworkedState from './NetworkedState';
import { StartScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';
import { Packet } from '../../../common/types';

export default class Before extends NetworkedState {
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

  public onPacket(packet: Packet) {
    if (packet.kind === 'fire') {
      if (packet.state === 'released') {
        if (this.game.captains.length >= 2) {
          this.state.start('Main');
        }
      }
    } else if (packet.kind === 'scan') {
      const captain = this.game.captains.find(
        cardID => cardID === packet.cardID,
      );
      if (!captain && packet.cardID !== 0) {
        this.game.captains.push(packet.cardID);
      } else {
        // TODO: add engineer
      }
    }
  }

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.add.existing(new StartScreen(this.game));

    // Update gamestate
    this.game.gameState = 'wait_for_players';
    this.game.add
      .audio('music_background')
      .play(undefined, undefined, undefined, true);
  }
}
