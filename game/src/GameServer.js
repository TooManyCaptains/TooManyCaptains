import io from 'socket.io-client'

export default class GameServer {
  constructor(URL) {
    this.socket = io(URL)
  }

  notifyGameState(gameState) {
    this.socket.emit('state', gameState)
  }

  notifyReady() {
    this.socket.emit('frontend-ready')
  }
}
