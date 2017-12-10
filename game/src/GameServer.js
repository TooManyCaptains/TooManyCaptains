import io from 'socket.io-client'

export default class GameServer {
  constructor() {
    this.baseURL = (function () {
      return window.location.search.includes('local') ?
        'http://localhost:9000' :
        'http://server.toomanycaptains.com'
    }())
    this.socket = io(this.baseURL)
  }

  notifyGameState(gameState) {
    this.socket.emit('state', gameState)
  }

  notifyReady() {
    this.socket.emit('frontend-ready')
  }
}
