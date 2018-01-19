"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const Scanner_1 = require("./Scanner");
const socket = io('http://server.toomanycaptains.com');
socket.on('connect', () => {
});
socket.on('packet', (data) => {
});
socket.on('disconnect', () => {
});
function sendPacket(packet) {
    socket.emit('packet', packet);
}
// @ts-ignore
const scanner = new Scanner_1.default(sendPacket);
//# sourceMappingURL=index.js.map