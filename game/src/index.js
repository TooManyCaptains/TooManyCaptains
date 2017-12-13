import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import Stats from 'stats.js'

import HUD from './HUD'
import Main from './Main'
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

class App extends React.Component {
  constructor(props) {
    super(props)

    const urlParams = getUrlParams(window.location.search)

    this.state = {
      isStarted: false,
      isOnValidDisplay: false,
      stats: {
        hullStrength: 100,
        weapons: [],
        shields: [],
        propulsion: 0,
        repairs: 0,
        communications: false,
      },
      config: {
        debug: _.has(urlParams, 'debug'),
        skip: _.has(urlParams, 'skip'),
        invulnerable: _.has(urlParams, 'invuln'),
      },
    }
  }

  componentDidMount() {
    this.checkDisplay()
    window.setInterval(() => this.checkDisplay(), 250)
    if (this.state.config.debug) {
      this.start()
    }
  }

  checkDisplay() {
    const isOnValidDisplay = window.screen.height === 1080 && window.screen.width === 1920
    if (this.state.isStarted && (!isOnValidDisplay || !window.document.webkitIsFullScreen)) {
      this.setState({ isOnValidDisplay })
      this.unstart()
    } else {
      this.setState({ isOnValidDisplay })
    }
  }

  start() {
    const root = window.document.querySelector('html')
    if (root.webkitRequestFullScreen) {
      root.webkitRequestFullScreen()
    } else if (window.document.mozRequestFullScreen) {
      root.mozRequestFullScreen()
    } else if (window.document.requestFullscreen) {
      root.requestFullscreen()
    } else {
      alert('sorry, your browser doesn\'t support the fullscreen API :(')
      return
    }
    window.setTimeout(() => {
      this.setState({ isStarted: true })
      if (!this.game) {
        this.initializeGameOnSurface()
      }
      this.game.paused = false
    }, 250)
  }

  unstart() {
    if (this.state.config.debug) {
      return
    }
    this.setState({ isStarted: false })
    this.game.paused = true
  }

  initializeGameOnSurface() {
    this.game = new Phaser.Game(
      window.innerWidth,
      window.innerHeight,
      Phaser.CANVAS,
      'surface',
    )
    this.game.state.add('Main', Main, false)
    this.game.state.start('Main')
    this.game.server = new GameServer()
    this.game.config = _.cloneDeep(this.state.config)
    const nativeHeight = 1080

    this.game.scaleFactor = window.innerHeight / nativeHeight

    const gameMainState = this.game.state.states.Main

    // Server events
    this.game.server.socket.on('move-up', data => gameMainState.onMoveUp(data))
    this.game.server.socket.on('move-down', data => gameMainState.onMoveDown(data))
    this.game.server.socket.on('fire', data => gameMainState.onFire(data))

    // Two callbacks for each server event.
    // The first is for react, and second for phaser.
    this.game.server.socket.on('weapons', data => {
      this.onWeaponsChanged(data)
      gameMainState.onWeaponsChanged(data)
    })
    this.game.server.socket.on('shields', data => {
      this.onShieldsChanged(data)
      gameMainState.onShieldsChanged(data)
    })
    this.game.server.socket.on('propulsion', data => {
      this.onPropulsionChanged(data)
      gameMainState.onPropulsionChanged(data)
    })
    this.game.server.socket.on('repairs', data => {
      this.onRepairsChanged(data)
      gameMainState.onRepairsChanged(data)
    })
    this.game.server.socket.on('communications', data => {
      this.onCommunicationsChanged(data)
      gameMainState.onCommunicationsChanged(data)
    })

    this.game.server.socket.emit('frontend-connected', {})

    this.game.onHullStrengthChanged = this.onHullStrengthChanged.bind(this)

    if (this.state.config.debug) {
      this.setupPerformanceStatistics()
    }
  }

  onHullStrengthChanged(hullStrength) {
    const stats = _.cloneDeep(this.state.stats)
    stats.hullStrength = hullStrength
    this.setState({ stats })
  }

  onWeaponsChanged(weapons) {
    const stats = _.cloneDeep(this.state.stats)
    stats.weapons = weapons
    this.setState({ stats })
  }

  onShieldsChanged(shields) {
    const stats = _.cloneDeep(this.state.stats)
    stats.shields = shields
    this.setState({ stats })
  }

  onPropulsionChanged(propulsion) {
    const stats = _.cloneDeep(this.state.stats)
    stats.propulsion = propulsion
    this.setState({ stats })
  }

  onRepairsChanged(repairs) {
    const stats = _.cloneDeep(this.state.stats)
    stats.repairs = repairs
    this.setState({ stats })
  }

  onCommunicationsChanged(communications) {
    const stats = _.cloneDeep(this.state.stats)
    stats.communications = communications
    this.setState({ stats })
  }

  setupPerformanceStatistics() {
    // Setup the new stats panel.
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.game.update
    this.game.update = (...args) => {
      stats.begin()
      updateLoop.apply(this.game, args)
      stats.end()
    }
  }

  render() {
    return (
      <div className="App" foo={this}/>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('surface'))
