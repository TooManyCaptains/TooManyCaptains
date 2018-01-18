"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
class Client {
    constructor(url, onPacket) {
        this.url = url;
        this.socket = io(url, { reconnection: true });
        this.socket.on('packet', onPacket);
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }
    sendPacket(packet) {
        this.socket.emit('packet', packet);
    }
    onConnect() {
        console.info('Connected to server');
    }
    onDisconnect() {
        console.warn('Disconnected from server');
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map