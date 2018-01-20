import io from 'socket.io-client'
import { GameState, Packet } from '../../common/types'

export default class GameServer {

  private socket: SocketIOClient.Socket

  constructor(URL: string) {
    this.socket = io(URL)
  }

  public notifyGameState(state: GameState) {
    const packet: Packet = {
      kind: 'gamestate',
      state,
    }
    this.socket.emit('packet', packet)
  }
}
