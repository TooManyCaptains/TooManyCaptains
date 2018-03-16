import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { GameState, GameStatePacket } from '../../common/types';
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ highScore: 0, volume: {}, count: 0 }).write();

// // Add a post
// db
//   .get('posts')
//   .push({ id: 1, title: 'lowdb is awesome' })
//   .write();

// // Set a user using Lodash shorthand syntax
// db.set('user.name', 'typicode').write();

// // Increment count
// db.update('count', n => n + 1).write();

let gameState: GameState = 'wait_for_players';

// set CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

io.on('connection', socket => {
  console.log('⚡️  connected');

  console.log('emitting gamestate packet');
  socket.emit('packet', {
    kind: 'gamestate',
    state: gameState,
  } as GameStatePacket);

  // Rebroadcast all packets
  socket.on('packet', packet => {
    if (packet.kind === 'gamestate') {
      gameState = packet.state;
    }
    socket.broadcast.emit('packet', packet);
    console.log(`relaying packet: ${JSON.stringify(packet)}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌  disconnected');
  });
});

const port = process.env.PORT || 9000;

server.listen(port, () => {
  console.log(`👾  serving on port ${port}`);
});
