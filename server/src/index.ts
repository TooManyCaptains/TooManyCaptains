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
  ScorePacket,
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
function emitVolumesFromDatabase(socket: SocketIO.Socket) {
  console.log('💾  emitting high score packet');
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

// Sends the stored highscore
function emitHighScoreFromDatabase(socket: SocketIO.Socket) {
  console.log('💾  emitting volume packets');
  const points = db.get('highScore').value() as number;
  socket.emit('packet', {
    kind: 'score',
    points,
    confirmedHighScore: true,
  } as ScorePacket);
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

  console.log('ℹ️   emitting gamestate packet');
  socket.emit('packet', {
    kind: 'gamestate',
    state: gameState,
  } as GameStatePacket);

  emitVolumesFromDatabase(socket);
  emitHighScoreFromDatabase(socket);

  // Rebroadcast all packets
  socket.on('packet', (packet: Packet) => {
    if (packet.kind === 'gamestate') {
      // Save game state in memory only
      gameState = packet.state;
    } else if (packet.kind === 'cheat' && packet.cheat.code === 'set_volume') {
      // Save volume to disk
      db.set(`volume.${packet.cheat.target}`, packet.cheat.volume).write();
    } else if (packet.kind === 'score') {
      // Save score to disk, if high score
      const currentHighScore = db.get('highScore').value() as number;
      if (packet.points > currentHighScore) {
        db.set('highScore', packet.points).write();
        emitHighScoreFromDatabase(socket);
      }
    }

    socket.broadcast.emit('packet', packet);
    console.log(`👂  relaying packet: ${JSON.stringify(packet)}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌  disconnected');
  });
});

const port = process.env.PORT || 9000;

server.listen(port, () => {
  console.log(`👾  serving on port ${port}`);
});
