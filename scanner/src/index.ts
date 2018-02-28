import * as io from 'socket.io-client';
import Scanner from './Scanner';
import { Packet } from '../../common/types';

const URL = 'http://starship:9000';

const socket = io(URL);

socket.on('connect', () => {
  console.log(`[Socket] connected to ${URL}`);
});

socket.on('packet', (packet: Packet) => {
  // no-op
});

socket.on('disconnect', () => {
  console.log(`[Socket] disconnected from ${URL}`);
});

function sendPacket(packet: Packet) {
  socket.emit('packet', packet);
}

console.log(`Attempting to connect to: ${URL}`);

// @ts-ignore
const scanner = new Scanner(sendPacket);
