import * as io from 'socket.io-client';
import Scanner from './Scanner';
import { Packet } from '../../common/types';

const URL = 'http://server.toomanycaptains.com';

const socket = io(URL);

socket.on('connect', () => {
  console.log(`[Socket] connected to ${URL}`);
});

socket.on('packet', (packet: Packet) => {
  console.log(`[Socket] received packet: ${JSON.stringify(packet)}`);
});

socket.on('disconnect', () => {
  console.log(`[Socket] disconnected from ${URL}`);
});

function sendPacket(packet: Packet) {
  socket.emit('packet', packet);
  console.log(`[Socket] sent packet: ${JSON.stringify(packet)}`);
}

// @ts-ignore
const scanner = new Scanner(sendPacket);
