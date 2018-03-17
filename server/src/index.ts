import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import {
  GameState,
  GameStatePacket,
  Packet,
  CheatPacket,
} from '../../common/types';
import { SetVolumeCheat } from '../../common/cheats';
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const adapter = new FileSync('/var/lib/toomanycaptains/db.json');
const db = low(adapter);

// Set some defaults (required if the JSON file is empty)
db
  .defaults({
    highScore: 0,
    volume: {
      master: 1,
      music: 1,
    },
    plays: 0,
  })
  .write();

// Sends the volumes that have been previously saved to disk
// via the LowDB database
function emitVolumesFromDisk(socket: SocketIO.Socket) {
  db
    .get('volume')
    .forEach((volume: number, target: string) => {
      socket.emit('packet', {
        kind: 'cheat',
        cheat: {
          code: 'set_volume',
          volume,
          target,
        } as SetVolumeCheat,
      } as CheatPacket);
    })
    .value();
}

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

  console.log('emitting volume packets');
  emitVolumesFromDisk(socket);

  // Rebroadcast all packets
  socket.on('packet', (packet: Packet) => {
    // Save game state in memory only
    if (packet.kind === 'gamestate') {
      gameState = packet.state;
      // Save volume to disk
    } else if (packet.kind === 'cheat' && packet.cheat.code === 'set_volume') {
      db.set(`volume.${packet.cheat.target}`, packet.cheat.volume).write();
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
