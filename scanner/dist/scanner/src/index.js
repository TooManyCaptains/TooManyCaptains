"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const Scanner_1 = require("./Scanner");
const URL = 'http://server.toomanycaptains.com';
const socket = io(URL);
socket.on('connect', () => {
    console.log(`[Socket] connected to ${URL}`);
});
socket.on('packet', (packet) => {
    console.log(`[Socket] received packet: ${JSON.stringify(packet)}`);
});
socket.on('disconnect', () => {
    console.log(`[Socket] disconnected from ${URL}`);
});
function sendPacket(packet) {
    socket.emit('packet', packet);
    console.log(`[Socket] sent packet: ${JSON.stringify(packet)}`);
}
// @ts-ignore
const scanner = new Scanner_1.default(sendPacket);
//# sourceMappingURL=index.js.map