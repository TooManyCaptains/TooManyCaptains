"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const scanner_1 = require("./scanner");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// set CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
io.on('connection', socket => {
    console.log('⚡️ connected');
    // Rebroadcast all packets
    socket.on('packet', packet => socket.broadcast.emit('packet', packet));
    socket.on('disconnect', () => {
        console.log('🔌  disconnected');
    });
});
if (!process.env.PORT) {
    new scanner_1.default(packet => io.emit('packet', packet));
}
const port = process.env.PORT || 9000;
server.listen(port, () => {
    console.log(`👾  Serving on port ${port}`);
});
//# sourceMappingURL=index.js.map