import _ from 'lodash'
import PlayerShip from './PlayerShip'
import { Enemy } from './Enemy'
import Asteroid from './Asteroid'
import Doors from './Doors'
import { setTimeout } from 'core-js/library/web/timers';

export default class Main extends Phaser.State {
  init() {
    this.game.renderer.renderSession.roundPixels = true
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.maxDistance = 3000
    this.minutesToPlanet = 3
    this.recentlyEnded = false
    this.gameState = 'before'
    this.distanceRemaining = this.maxDistance
    this.msPerDistanceUnit = (this.minutesToPlanet * 60 * 1000) / this.maxDistance
    this.game.stage.disableVisibilityChange = true
    this.game.paused = true

    // XXX: Periodically notify controller about state, since its not persisted
    setInterval(() => this.game.server.notifyGameState(this.gameState), 250)
  }

  preload() {
    this.load.image('background', 'assets/background.png')
    this.load.image('planet', 'assets/planet.png')
    this.load.spritesheet('player', 'assets/player-ship.png', 200, 120)
    this.load.image('bullet', 'assets/bullets/beam_Y.png')

    this.load.image('beam_B', 'assets/bullets/beam_B.png')
    this.load.image('beam_Y', 'assets/bullets/beam_Y.png')
    this.load.image('beam_R', 'assets/bullets/beam_R.png')

    this.load.image('bullet_B', 'assets/bullets/bullet_B.png')
    this.load.image('bullet_BY', 'assets/bullets/bullet_BY.png')
    this.load.image('bullet_BRY', 'assets/bullets/bullet_BRY.png')
    this.load.image('bullet_BR', 'assets/bullets/bullet_BR.png')
    this.load.image('bullet_R', 'assets/bullets/bullet_R.png')
    this.load.image('bullet_RY', 'assets/bullets/bullet_RY.png')
    this.load.image('bullet_Y', 'assets/bullets/bullet_Y.png')

    this.load.image('bullet_shoot_B', 'assets/bullets/bullet_shoot_B.png')
    this.load.image('bullet_shoot_BY', 'assets/bullets/bullet_shoot_BY.png')
    this.load.image('bullet_shoot_BRY', 'assets/bullets/bullet_shoot_BRY.png')
    this.load.image('bullet_shoot_BR', 'assets/bullets/bullet_shoot_BR.png')
    this.load.image('bullet_shoot_R', 'assets/bullets/bullet_shoot_R.png')
    this.load.image('bullet_shoot_RY', 'assets/bullets/bullet_shoot_RY.png')
    this.load.image('bullet_shoot_Y', 'assets/bullets/bullet_shoot_Y.png')

    this.load.image('shield_B', 'assets/shields/shield_B.png')
    this.load.image('shield_BY', 'assets/shields/shield_YB.png')
    this.load.image('shield_BR', 'assets/shields/shield_RB.png')
    this.load.image('shield_BRY', 'assets/shields/shield_RYB.png')
    this.load.image('shield_R', 'assets/shields/shield_R.png')
    this.load.image('shield_RY', 'assets/shields/shield_RY.png')
    this.load.image('shield_Y', 'assets/shields/shield_Y.png')

    this.load.image('weapon-sight', 'assets/weapon-sight.png')

    this.load.spritesheet('explosion', 'assets/explosion.png', 160, 160)

    const enemyWidth = 150
    const enemyHeight = 65
    this.load.spritesheet('enemy_RR', 'assets/enemies/enemy_RR.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_RY', 'assets/enemies/enemy_RY.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_RB', 'assets/enemies/enemy_RB.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_YR', 'assets/enemies/enemy_YR.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_YY', 'assets/enemies/enemy_YY.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_YB', 'assets/enemies/enemy_YB.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_BR', 'assets/enemies/enemy_BR.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_BY', 'assets/enemies/enemy_BY.png', enemyWidth, enemyHeight)
    this.load.spritesheet('enemy_BB', 'assets/enemies/enemy_BB.png', enemyWidth, enemyHeight)

    this.load.image('gameover', 'assets/gameover.png')
    this.load.image('asteroid', 'assets/asteroid.png')

    // XXX: Not actually rendered by phaser, but this is a way to preload the image
    this.load.image('gameover-bg', 'assets/gameover-bg.png')
    this.load.image('door-left', 'assets/door-left.png')
    this.load.image('door-right', 'assets/door-right.png')

    this.load.audio('shoot', 'assets/sounds/shoot.wav')
    this.load.audio('move_slow', 'assets/sounds/move_slow.wav')
    this.load.audio('move_fast', 'assets/sounds/move_fast.wav')
    this.load.audio('charging', 'assets/sounds/charging.wav')
    this.load.audio('doors_open', 'assets/sounds/doors_open.wav')
    this.load.audio('doors_close', 'assets/sounds/doors_close.wav')
    this.load.audio('explosion', 'assets/sounds/explosion.wav')
    this.load.audio('shield', 'assets/sounds/shield.wav')
    this.load.audio('damaged', 'assets/sounds/damaged.wav')
    this.load.audio('collide', 'assets/sounds/collide.wav')
    this.load.audio('gameover', 'assets/sounds/gameover.wav')
  }

  create() {
    // Background
    this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height / 2, 'background')
    this.background.autoScroll(-10, 0)

    // Planet
    this.planet = this.add.sprite(this.game.width, this.game.height / 4, 'planet')
    this.planet.anchor.setTo(0.5, 0.5)
    this.planet.scale.set(this.game.scaleFactor, this.game.scaleFactor)
    this.game.physics.enable(this.planet, Phaser.Physics.ARCADE)
    this.planet.update = () => { this.planet.angle -= 0.05 }


    // Score text
    const rectWidth = 260 * this.game.scaleFactor
    const rectHeight = 69 * this.game.scaleFactor
    const rectOffsetFromEdge = 15 * this.game.scaleFactor
    const offsetLeft = 21 * this.game.scaleFactor
    const offsetTop = 14 * this.game.scaleFactor
    const graphics = this.game.add.graphics(
      this.game.width - rectWidth - rectOffsetFromEdge,
      this.game.height / 4 - (rectHeight / 2),
    )
    graphics.lineStyle(2, 0x000000, 1)
    graphics.beginFill(0xffffff)
    graphics.drawRoundedRect(0, 0, rectWidth, rectHeight, 37.5 * this.game.scaleFactor)
    this.scoreText = this.game.add.text(
      this.game.width - rectWidth - rectOffsetFromEdge + offsetLeft,
      this.game.height / 4 - (rectHeight / 2) + offsetTop,
      '',
      { font: `${32 * this.game.scaleFactor}px Exo 2`, fill: 'black', fontWeight: 900 },
    )

    // Boundaries for the playable game area
    this.maxX = this.game.width - this.planet.width / 2 - rectOffsetFromEdge
    this.maxY = this.game.height / 2

    // Score timer
    this.game.score = 0
    const scoreTimer = this.game.time.create()
    scoreTimer.loop(250, () => this.game.score += 1)
    scoreTimer.start()

    // Player ship
    this.player = this.game.add.existing(new PlayerShip(this.game))
    this.game.player = this.player

    // Add starting enemies
    const numStartingEnemies = 3
    this.enemies = []
    _.times(numStartingEnemies, i => {
      this.spawnEnemy(this.maxY * i / numStartingEnemies + (this.maxY / numStartingEnemies / 2))
    })

    // Doors
    this.doors = this.game.add.existing(new Doors(this.game))

    // Periodically spawn an asteroid
    const asteroidSpawnIntervalSecs = 20
    const asteroidTimer = this.game.time.create()
    asteroidTimer.loop(asteroidSpawnIntervalSecs * 1000, () => this.spawnAsteroid(this.game.height * Math.random()))
    asteroidTimer.start()
    this.asteroids = []

    // Periodically spawn a new enemy
    const enemySpawnIntervalSecs = 35
    const enemyTimer = this.game.time.create()
    enemyTimer.loop(enemySpawnIntervalSecs * 1000, () => this.spawnEnemy(this.game.height * Math.random()))
    enemyTimer.start()

    // Sound FX
    this.shieldFx = this.game.add.audio('shield')
    this.damagedFx = this.game.add.audio('damaged')
    this.collideFx = this.game.add.audio('collide')
    this.gameoverFx = this.game.add.audio('gameover')

    // Input
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.spawnEnemy(this.maxY * Math.random()), this)

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.A)
      .onDown.add(() => this.spawnAsteroid(this.maxY * Math.random()), this)

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.K)
      .onDown.add(() => this.player.kill(), this)

    this.game.server.notifyGameState(this.gameState)

    if (this.game.config.skip) {
      this.startGame()
    }

    if (this.game.config.invulnerable) {
      const health = 100 * 1000
      this.player.maxHealth = health
      this.player.health = health
    }
  }

  spawnEnemy(yInitial) {
    const x = this.maxX
    const colors = 'RYB'.split('')
    const allEnemyTypes = _.flatten(colors.map(a => colors.map(b => a + b)))
    const randomEnemyType = _.sample(allEnemyTypes)
    const enemy = this.game.add.existing(new Enemy(this.game, x, yInitial, ...randomEnemyType))
    this.enemies.push(enemy)
  }

  spawnAsteroid(yInitial) {
    const x = this.maxX
    const asteroid = this.game.add.existing(new Asteroid(this.game, x, yInitial))
    asteroid.sendToBack()
    this.background.sendToBack()
    this.asteroids.push(asteroid)
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
    if (this.gameState !== 'start') return
    this.player.setWeapons(colors)
  }

  onShieldsChanged(colors) {
    if (this.gameState !== 'start') return
    this.player.setShields(colors)
  }

  onPropulsionChanged(level) {
    if (this.gameState !== 'start') return
    this.player.setPropulsionLevel(level)
  }

  onRepairsChanged(level) {
    if (this.gameState !== 'start') return
    this.player.setRepairLevel(level)
  }

  onCommunicationsChanged(isEnabled) {
    if (this.gameState !== 'start') return
    console.info('communications', isEnabled)
  }

  onFire(state) {
    if (this.gameState === 'before') {
      this.startGame.call(this)
    } else if (this.gameState === 'over' && !this.recentlyEnded) {
      window.location.reload()
    } else if (this.gameState === 'start' && this.player) {
      if (state === 'start') {
        this.player.startChargingWeapon.call(this.player)
      } else if (state === 'stop') {
        this.player.stopChargingWeaponAndFireIfPossible()
      }
    }
  }

  update() {
    // Update game play time
    this.game.playTimeMS = this.game.time.now - this.game.time.pauseDuration

    // Update distance travelled
    // const distanceTravelled = this.game.playTimeMS / this.msPerDistanceUnit
    // this.distanceRemaining = _.round(Math.max(0, this.maxDistance - distanceTravelled))
    // this.distanceText.text = `${this.distanceRemaining} KM`
    this.scoreText.text = `SCORE: ${this.game.score}`

    // Kill sprites marked for killing
    this.game.world.children
      .filter(child => child.kill_in_next_tick)
      .map(child => child.kill())

    // Player <-> enemy bullet collision
    this.enemies.forEach(enemy => this.physics.arcade.overlap(
      enemy.weapon,
      this.player,
      (player, bullet) => {
        const playerHasMatchingShield = player.shieldColors
          .some(color => color[0].toUpperCase() === enemy.weaponType)
        // Bullet hits
        if (player.shieldColors.length === 0 || !playerHasMatchingShield) {
          player.damage(enemy.weapon.bulletDamage)
          this.damagedFx.play()
          player.getHurtTint()
        } else {
          player.damage(enemy.weapon.bulletDamage * 0.05)
          this.shieldFx.play()
        }
        bullet.kill()
      },
      null,
      this,
    ))

    // Planet <-> enemy bullet collision
    if (this.player.weapon) {
      this.physics.arcade.overlap(
        this.planet,
        this.player.weapon,
        (planet, bullet) => {
          bullet.kill()
        },
        null,
        this,
      )
    }

    // Enemy <-> player bullet collision
    if (this.player.weapon) {
      this.enemies.forEach(enemy => this.physics.arcade.overlap(
        enemy,
        this.player.weapon,
        (e, bullet) => {
          const playerBulletCanHurtEnemy = bullet.color.includes(enemy.type)
          // Bullet hits
          if (playerBulletCanHurtEnemy) {
            enemy.getHurtTint()
            enemy.damage(bullet.damage)
          } else {
            this.shieldFx.play()
          }
          bullet.kill()
        },
        null,
        this,
      ))
    }

    // Enemy <-> player ship (no shield) collision
    this.enemies.forEach(enemy => this.physics.arcade.overlap(
      enemy,
      this.player,
      (e, player) => {
        enemy.kill_in_next_tick = true
        player.getHurtTint()
        player.damage(enemy.collisionDamage)
      },
      null,
      this,
    ))

    // Player <-> asteroid collision
    this.asteroids.forEach(asteroid => this.physics.arcade.overlap(
      asteroid,
      this.player,
      (e, player) => {
        asteroid.kill_in_next_tick = true
        player.getHurtTint()
        player.damage(asteroid.collisionDamage)
        this.collideFx.play()
      },
      null,
      this,
    ))

    // Check if game ended and notify server if needed
    this.checkAndNotifyIfGameEnded()
  }

  startGame() {
    this.game.paused = false
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
    this.doors.close(() => {
      this.gameoverFx.play()
    })

    window.setTimeout(() => this.recentlyEnded = false, 7500)
  }

  checkAndNotifyIfGameEnded() {
    const isGameEnding = !this.player.alive

    // Did the game just end now (i.e. it was previously not ended)?
    if (isGameEnding && this.gameState === 'start') {
      this.endGame()
    }
  }
  //
  // render() {
  //   if (this.player.weapon) {
  //     this.player.weapon.bullets.forEach(b => this.game.debug.body(b))
  //   }
  //   this.background.sendToBack()
  // }
}
