import io from 'socket.io-client'

export default class GameServer {
  constructor(URL) {
    this.socket = io(URL)
  }

  notifyGameState(gameState) {
    this.socket.emit('packet', {
      kind: 'gamestate',
      state: gameState,
    })
  }
}
