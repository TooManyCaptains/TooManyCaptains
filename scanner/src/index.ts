import * as io from 'socket.io-client'
import Scanner from './Scanner'
import { Packet } from '../../common/types'

const socket = io('http://server.toomanycaptains.com')

socket.on('connect', () => {

})

socket.on('packet', (data: Packet) => {

})

socket.on('disconnect', () => {

})

function sendPacket(packet: Packet) {
  socket.emit('packet', packet)
}

// @ts-ignore
const scanner = new Scanner(sendPacket)
