import * as io from 'socket.io-client'
import { GameState, Event } from './types'

export class Client {

  public readonly url: string
  private socket: SocketIOClient.Socket

  constructor(url: string, onGameStateChanged: (state: GameState) => void, onFrontendReady: () => void) {
    this.url = url
    this.socket = io(url, { reconnection: true })
    this.socket.on('frontend-ready', onFrontendReady)
    this.socket.on('state', onGameStateChanged)
    this.socket.on('connect', this.onConnect.bind(this))
    this.socket.on('disconnect', this.onDisconnect.bind(this))
  }

  public emit(event: Event) {
    const { name, data } = event
    this.socket.emit(name, data)
  }

  private onConnect() {
    console.info('Connected to server')
  }

  private onDisconnect() {
    console.warn('Disconnected from server')
  }

}
