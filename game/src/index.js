import _ from 'lodash'
import Stats from 'stats.js'
import Main from './states/Main'
import Boot from './states/Boot'
import Before from './states/Before'
import Preload from './states/Preload'
import After from './states/After'
import './index.css'
import GameServer from './GameServer'

function getUrlParams(search) {
  const hashes = search.slice(search.indexOf('?') + 1).split('&')
  const params = {}
  hashes.forEach(hash => {
    const [key, val] = hash.split('=')
    params[key] = decodeURIComponent(val)
  })

  return params
}

function getConfig() {
  const urlParams = getUrlParams(window.location.search)

  const config = {
    debug: _.has(urlParams, 'debug'),
    skip: _.has(urlParams, 'skip'),
    invulnerable: _.has(urlParams, 'invuln'),
    local: _.has(urlParams, 'local'),
  }
  if (config.local) {
    config.serverURL = 'http://localhost:9000'
  } else {
    config.serverURL = 'http://server.toomanycaptains.com'
  }
  return config
}

class Game extends Phaser.Game {
  constructor() {
    super(1920, 1080, Phaser.CANVAS, 'surface')
    this.state.add('Boot', Boot, false)
    this.state.add('Preload', Preload, false)
    this.state.add('Before', Before, false)
    this.state.add('Main', Main, false)
    this.state.add('After', After, false)

    this.params = getConfig()
    this.scaleFactor = 1

    // Kick things off with the boot state.
    this.state.start('Boot')
    this.bindServerEvents()

    if (this.params.debug) {
      this.setupPerformanceStatistics()
    }
  }

  bindServerEvents() {
    this.server = new GameServer(this.params.serverURL)
    const gameMainState = this.state.states.Main
    // XXX: FIXME
    const that = this
    this.server.socket.on('packet', packet => {
      console.log(packet)
      if (packet.kind === 'wiring') {
        if (packet.subsystem === 'weapons') {
          gameMainState.onWeaponsChanged(packet.wires)
        } else if (packet.subsystem === 'shields') {
          gameMainState.onShieldsChanged(packet.wires)
        } else if (packet.subsystem === 'propulsion') {
          gameMainState.onPropulsionChanged(packet.wires)
        } else if (packet.subsystem === 'repairs') {
          gameMainState.onRepairsChanged(packet.wires)
        }
      }
      else if (packet.kind === 'move') {
        if (packet.state === 'released') {
          gameMainState.onMoveStop()
        } else if (packet.direction === 'up') {
          gameMainState.onMoveUp()
        } else if (packet.direction === 'down') {
          gameMainState.onMoveDown()
        }
      }
      else if (packet.kind === 'fire') {
        // debugger;
        if (that.state.current === 'Before' && packet.state === 'released') {
          that.state.start('Main')
        } else if (that.state.current === 'After' && packet.state === 'released') {
          that.state.start('Main')
        } else if (that.state.current === 'Main') {
          gameMainState.onFire(packet.state)
        }
      }
      else if (packet.kind === 'scan') {

      }
    })
  }

  setupPerformanceStatistics() {
    // Setup the new stats panel.
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.update
    this.update = (...args) => {
      stats.begin()
      updateLoop.apply(this, args)
      stats.end()
    }
  }
}

new Game()
