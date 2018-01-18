import * as _ from 'lodash'
import * as React from 'react'
import * as io from 'socket.io-client'
import * as Spinner from 'react-spinkit'
import { Bay } from './bay'
import { Wire, wireName } from './types'
import './app.css'
import { Packet, Color, Subsystem } from '../../common/types'

const NUM_WIRES = 3
const BASE_URL = (() =>
  window.location.search.includes('local') ?
  'http://localhost:9000' :
  'http://server.toomanycaptains.com'
)()

interface AppState {
  wires: Wire[]
  isLoading: boolean
  overHeatTimer: number | null
  shieldTimer: number | null
  socket: SocketIOClient.Socket,
}

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props)
    this.state = {
      wires: _.range(NUM_WIRES).map(i => ({ color: i, inUse: false } as Wire)),
      isLoading: true,
      shieldTimer: null,
      overHeatTimer: null,
      socket: io(BASE_URL),
    }
    this.state.socket.on('connect', () => this.setState({isLoading: false}))
    this.state.socket.on('disconnect', () => this.setState({isLoading: true}))
  }

  public render() {
    if (this.state.isLoading) {
      return (
        <div className="App">
          <Spinner name="wandering-cubes" color="white"/>
        </div>
      )
    }

    return (
      <div className="App">
        <div className="Bays">
          <Bay
            name="Weapons"
            numPorts={3}
            wires={this.state.wires}
            onNewConfiguration={this.onSubsystemWiringChanged.bind(this)}
            onWireAdded={this.onWireAdded.bind(this)}
            onWireRemoved={this.onWireRemoved.bind(this)}
          >
            <div
              className="FireButton"
              onTouchStart={() => this.fireButton('start')}
              onTouchEnd={() => this.fireButton('stop')}
              onMouseDown={() => this.fireButton('start')}
              onMouseUp={() => this.fireButton('stop')}
            />
          </Bay>
            <Bay
              name="Shields"
              numPorts={3}
              wires={this.state.wires}
              onNewConfiguration={this.onSubsystemWiringChanged.bind(this)}
              onWireAdded={this.onWireAdded.bind(this)}
              onWireRemoved={this.onWireRemoved.bind(this)}
          />
          <Bay
            name="Propulsion"
            numPorts={2}
            wires={this.state.wires}
            onNewConfiguration={this.onSubsystemWiringChanged.bind(this)}
            onWireAdded={this.onWireAdded.bind(this)}
            onWireRemoved={this.onWireRemoved.bind(this)}
          >
            <div className="Propulsion-controls">
              <div
                className="Move"
                onTouchStart={() => this.setMovement('up')}
                onTouchEnd={() => this.setMovement('stop')}
                onMouseDown={() => this.setMovement('up')}
                onMouseUp={() => this.setMovement('stop')}>⬆</div>
              <div
                className="Move"
                onTouchStart={() => this.setMovement('down')}
                onTouchEnd={() => this.setMovement('stop')}
                onMouseDown={() => this.setMovement('down')}
                onMouseUp={() => this.setMovement('stop')}>⬇</div>
            </div>
          </Bay>
          <Bay
            name="Repairs"
            numPorts={3}
            wires={this.state.wires}
            onNewConfiguration={this.onSubsystemWiringChanged.bind(this)}
            onWireAdded={this.onWireAdded.bind(this)}
            onWireRemoved={this.onWireRemoved.bind(this)}
          />
        </div>
      </div>
    )
  }

  private sendPacket(packet: Packet) {
    this.state.socket.emit('packet', packet)
  }

  private fireButton(state: 'start' | 'stop') {
    this.state.socket.emit('fire', state)
  }

  private setMovement(direction: 'up' | 'down' | 'stop') {
    if (direction === 'up' || direction === 'down') {
      this.sendPacket({
        kind: 'move',
        direction: 'up',
        state: 'pressed',
      })
    } else if (direction === 'down') {
      this.sendPacket({
        kind: 'move',
        direction: 'down',
        state: 'pressed',
      })
    } else {
      this.state.socket.emit('move-up', 'stop')
      this.state.socket.emit('move-down', 'stop')
    }
  }

  private onWireAdded(wire: Wire) {
    const wires = this.state.wires.map(w => {
      if (w.color === wire.color) {
        w.inUse = true
      }
      return w
    })
    this.setState({wires})
  }

  private onWireRemoved(wire: Wire) {
    const wires = this.state.wires.map(w => {
      if (w.color === wire.color) {
        w.inUse = false
      }
      return w
    })
    this.setState({wires})
  }

  private onSubsystemWiringChanged(subsystem: Subsystem, wires: Array<Wire | null>) {
    const colors = wires
      .filter(wire => wire !== null)
      .map(wire => wireName(wire)) as Color[]
    this.sendPacket({
      kind: 'wiring',
      subsystem,
      wires: colors,
    })
  }

}

export default App
