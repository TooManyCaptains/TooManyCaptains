import { EndScreen } from '../interface/Screens';
import Doors from '../interface/Doors';
import { Game } from '../index';
import NetworkedState from './NetworkedState';
import { Packet } from '../../../common/types';

export default class After extends NetworkedState {
  public game: Game;

  public create() {
    this.game.add.existing(new Doors(this.game));
    this.game.add.existing(new EndScreen(this.game));
    this.game.sound.stopAll();
    this.game.add.audio('gameover').play();
  }

  public onPacket(packet: Packet) {
    if (packet.kind === 'fire') {
      if (packet.state === 'released') {
        this.state.start('Before');
      }
    }
  }
}
