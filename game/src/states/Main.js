import Board from '../entities/Board'
import Doors from '../interface/Doors'
import HUD from '../interface/HUD'

export default class Main extends Phaser.State {
  init() {
    this.recentlyEnded = false
    this.gameState = 'before'

    // XXX: Periodically notify controller about state, since its not persisted
    setInterval(() => this.game.server.notifyGameState(this.gameState), 250)
  }

  preload() {
    this.load.spritesheet('player', 'assets/sprites/player-ship.png', 200, 120)
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
    // Add the game board
    this.board = new Board(this.game, this.game.width, this.game.height / 2)
    this.player = this.board.player

    // Panels for HUD
    this.hud = new HUD(this.game, 0, this.game.height / 2, this.game.width, this.game.height / 2)

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

  onMoveUp(data) {
    if (data === 'start') {
      this.player.startMovingUp()
    } else if (data === 'stop') {
      this.player.stopMoving()
    }
  }

  onMoveDown(data) {
    if (data === 'start') {
      this.player.startMovingDown()
    } else if (data === 'stop') {
      this.player.stopMoving()
    }
  }

  onWeaponsChanged(colors) {
    this.player.setWeapons(colors)
  }

  onShieldsChanged(colors) {
    this.player.setShields(colors)
  }

  onPropulsionChanged(level) {
    this.player.setPropulsionLevel(level)
  }

  onRepairsChanged(level) {
    this.player.setRepairLevel(level)
  }

  onFire(state) {
    if (state === 'start') {
      this.player.startChargingWeapon.call(this.player)
    } else if (state === 'stop') {
      this.player.stopChargingWeaponAndFireIfPossible()
    }
  }

  update() {
    const isGameEnding = !this.player.alive

    // Did the game just end now (i.e. it was previously not ended)?
    if (isGameEnding && this.gameState === 'start') {
      this.endGame()
    }
  }

  startGame() {
    this.game.world.bringToTop(this.doors)
    this.doors.open(() => {
      this.gameState = 'start'
      this.game.server.notifyGameState(this.gameState)
      this.game.server.notifyReady()
    })
  }

  endGame() {
    this.gameState = 'over'
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
