import Board from '../entities/Board'
import Doors from '../interface/Doors'
import HUD from '../interface/HUD'

export default class Main extends Phaser.State {
  init() {
    this.recentlyEnded = false
    this.gameState = 'wait_for_players'

    // XXX: Periodically notify controller about state, since its not persisted
    // setInterval(() => this.game.server.notifyGameState(this.gameState), 250)
  }

  preload() {
    this.load.spritesheet('player-ship', 'assets/sprites/player-ship.png', 200, 120)
    this.load.spritesheet('explosion', 'assets/sprites/explosion.png', 160, 160)
    const enemyWidth = 150
    const enemyHeight = 65
    this.load.spritesheet('enemy_RR', 'assets/sprites/enemy_RR.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_RY', 'assets/sprites/enemy_RY.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_RB', 'assets/sprites/enemy_RB.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_YR', 'assets/sprites/enemy_YR.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_YY', 'assets/sprites/enemy_YY.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_YB', 'assets/sprites/enemy_YB.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_BR', 'assets/sprites/enemy_BR.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_BY', 'assets/sprites/enemy_BY.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_BB', 'assets/sprites/enemy_BB.png', enemyWidth, enemyHeight)
    this.doors = new Doors(this.game)
  }

  create() {
    // Background
    this.background = this.game.add.tileSprite(0, 0, this.game.width, 730, 'background', undefined)
    this.background.autoScroll(-10, 0)

    // Add the game board
    this.board = new Board(this.game, this.game.width, 680)
    this.player = this.board.player

    // Captains
    const names = ['AVI', 'DAE', 'KEL', 'ANU']
    this.game.captains = names.map((name, i) => ({
      name,
      number: i + 1,
      charge: 1,
    }))

    // Recharge captains energy
    this.captainRechargePerSecond = 0.1
    this.captainRechargeTimerFreq = 50
    this.game.time.create()
      .loop(this.captainRechargeTimerFreq, this.onRechargeCaptains, this)
      .timer
      .start()

    // Panels for HUD
    this.hud = new HUD(this.game, 0, this.board.bottom, this.game.width, 410)

    // Periodically spawn an asteroid
    const asteroidSpawnIntervalSecs = 20
    const asteroidTimer = this.game.time.create()
    asteroidTimer.loop(asteroidSpawnIntervalSecs * 1000, () => this.board.spawnAsteroid())
    asteroidTimer.start()

    // Periodically spawn a new enemy
    const enemySpawnIntervalSecs = 35
    const enemyTimer = this.game.time.create()
    enemyTimer.loop(enemySpawnIntervalSecs * 1000, () => this.board.spawnEnemy())
    enemyTimer.start()

    // Input
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.board.spawnEnemy(), this)

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.A)
      .onDown.add(() => this.board.spawnAsteroid(), this)

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.K)
      .onDown.add(() => this.player.kill(), this)

    this.game.server.notifyGameState(this.gameState)

    if (this.game.params.invulnerable) {
      const health = 100 * 1000
      this.player.maxHealth = health
      this.player.health = health
    }

    this.startGame()
  }

  onRechargeCaptains() {
    const delta = this.captainRechargePerSecond * (this.captainRechargeTimerFreq / 1000)
    this.captains = this.game.captains.map(captain => {
      captain.charge = Math.min(1, captain.charge + delta)
      return captain
    })
  }

  onMoveUp() {
    if (this.player.batteries.propulsion > 0) {
      this.player.startMovingUp()
    }
  }

  onMoveDown() {
    if (this.player.batteries.propulsion > 0) {
      this.player.startMovingDown()
    }
  }

  onMoveStop() {
    this.player.stopMoving()
  }

  onWeaponsChanged(colors) {
    this.player.setWeapons(colors)
  }

  onShieldsChanged(colors) {
    this.player.setShields(colors)
  }

  onPropulsionChanged(colors) {
    this.player.setPropulsionLevel(colors.length)
  }

  onRepairsChanged(colors) {
    this.player.setRepairLevel(colors.length)
  }

  onFire(state) {
    if (this.player.batteries.weapons === 0) {
      return
    }
    if (state === 'pressed') {
      this.player.startChargingWeapon.call(this.player)
    } else if (state === 'released') {
      this.player.stopChargingWeaponAndFireIfPossible()
    }
  }

  update() {
    const isGameEnding = !this.player.alive

    // Did the game just end now (i.e. it was previously not ended)?
    if (isGameEnding && this.gameState === 'in_game') {
      this.endGame()
    }
  }

  startGame() {
    this.game.world.bringToTop(this.doors)
    this.doors.open(() => {
      this.gameState = 'in_game'
      this.game.server.notifyGameState(this.gameState)
      // this.game.server.notifyReady()
    })
  }

  endGame() {
    this.gameState = 'game_over'
    this.game.server.notifyGameState(this.gameState)
    this.recentlyEnded = true
    this.game.physics.paused = true
    this.game.world.bringToTop(this.doors)
    this.doors.close(() => {
      this.game.state.start('After')
    })
    window.setTimeout(() => this.recentlyEnded = false, 7500)
  }
}
