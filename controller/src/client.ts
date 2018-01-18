import * as io from 'socket.io-client'
import { Packet } from './types'

export class Client {

  public readonly url: string
  private socket: SocketIOClient.Socket

  constructor(url: string, onPacket: (packet: Packet) => void) {
    this.url = url
    this.socket = io(url, { reconnection: true })
    this.socket.on('packet', onPacket)
    this.socket.on('connect', this.onConnect.bind(this))
    this.socket.on('disconnect', this.onDisconnect.bind(this))
  }

  public sendPacket(packet: Packet) {
    this.socket.emit('packet', packet)
  }

  private onConnect() {
    console.info('Connected to server')
  }

  private onDisconnect() {
    console.warn('Disconnected from server')
  }

}
