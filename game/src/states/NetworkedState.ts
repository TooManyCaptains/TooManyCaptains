import { Packet } from '../../../common/types';

export default abstract class NetworkedState extends Phaser.State {
  public abstract onPacket(packet: Packet): void;
}
