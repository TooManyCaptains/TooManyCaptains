import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

  // Rebroadcast all packets
  socket.on('packet', packet => {
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
