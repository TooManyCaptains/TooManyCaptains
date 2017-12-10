import * as express from 'express'
import * as http from 'http'
import * as socketIo from 'socket.io'
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

// set CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

io.on('connection', socket => {
  console.log('⚡️ connected')
  const broadcastEvents = [
    'fire',
    'move-up',
    'move-down',

    'weapons',
    'shields',
    'repairs',
    'propulsion',
    'communications',

    'frontend-ready',

    'state',
  ]
  broadcastEvents.map(event => socket.on(event, data => {
    console.log(event, data)
    socket.broadcast.emit(event, data)
  }))

  socket.on('disconnect', () => {
    console.log('🔌  disconnected')
  })
})

const port = process.env.PORT || 9000
server.listen(port, () => {
  console.log(`👾  Serving on port ${port}`)
})
