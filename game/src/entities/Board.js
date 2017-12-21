import _ from 'lodash'

import PlayerShip from './PlayerShip'
import { Enemy } from '../entities/Enemy'

import Asteroid from './Asteroid'

export default class Board extends Phaser.Group {
  constructor(game, width, height) {
    super(game)

    // Sound FX
    this.shieldFx = this.game.add.audio('shield')
    this.damagedFx = this.game.add.audio('damaged')
    this.collideFx = this.game.add.audio('collide')

    // Background
    this.background = this.game.add.tileSprite(0, 0, width, height, 'background', undefined, this)
    this.background.autoScroll(-10, 0)

    // Planet
    this.planet = this.game.add.sprite(width, height / 2, 'planet', undefined, this)
    this.planet.anchor.setTo(0.5, 0.5)
    this.game.physics.enable(this.planet, Phaser.Physics.ARCADE)
    this.planet.update = () => {
      this.planet.angle -= 0.05
    }

    // Mask (overflow)
    const mask = this.game.add.graphics(0, 0, this)
    mask.beginFill(0xff0000)
    mask.drawRect(0, 0, width, height)
    this.mask = mask

    // Score text
    const rectWidth = 260 * this.game.scaleFactor
    const rectHeight = 69 * this.game.scaleFactor
    const rectOffsetFromEdge = 15 * this.game.scaleFactor
    const offsetLeft = 21 * this.game.scaleFactor
    const offsetTop = 14 * this.game.scaleFactor
    const graphics = this.game.add.graphics(
      width - rectWidth - rectOffsetFromEdge,
      height / 2 - (rectHeight / 2),
      this,
    )
    graphics.lineStyle(2, 0x000000, 1)
    graphics.beginFill(0xffffff)
    graphics.drawRoundedRect(0, 0, rectWidth, rectHeight, 37.5 * this.game.scaleFactor)
    this.scoreText = this.game.add.text(
      width - rectWidth - rectOffsetFromEdge + offsetLeft,
      height / 2 - (rectHeight / 2) + offsetTop,
      '',
      { font: `${32 * this.game.scaleFactor}px Exo 2`, fill: 'black', fontWeight: 900 },
      this,
    )

    // Boundaries for the playable game area
    this.maxX = width - this.planet.width / 2 - rectOffsetFromEdge
    this.maxY = height

    // Score timer
    this.game.score = 0
    const scoreTimer = this.game.time.create()
    scoreTimer.loop(250, () => this.game.score += 1)
    scoreTimer.start()

    // Player ship
    this.player = new PlayerShip(this.game, 125, height / 2)
    this.add(this.player)
    this.game.player = this.player

    // Add starting enemies
    const numStartingEnemies = 3
    this.enemies = []
    _.times(numStartingEnemies, i => {
      this.spawnEnemy(height * i / numStartingEnemies + (height / numStartingEnemies))
    })

    // Asteroids
    this.asteroids = []
  }

  spawnEnemy() {
    const x = this.maxX
    const y = this.maxY * Math.random()
    const colors = 'RYB'.split('')
    const allEnemyTypes = _.flatten(colors.map(a => colors.map(b => a + b)))
    const randomEnemyType = _.sample(allEnemyTypes)
    const enemy = this.add(new Enemy(this.game, x, y, ...randomEnemyType))
    this.enemies.push(enemy)
  }

  spawnAsteroid() {
    const x = this.maxX
    const y = this.maxY * Math.random()
    const asteroid = this.addAt(new Asteroid(this.game, x, y), 1)
    this.asteroids.push(asteroid)
  }

  update() {
    super.update()
    this.scoreText.text = `SCORE: ${this.game.score}`

    // Kill sprites marked for killing
    this.children
      .filter(child => child.kill_in_next_tick)
      .map(child => child.kill())

    // Player <-> enemy bullet collision
    this.enemies.forEach(enemy => this.game.physics.arcade.overlap(
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
      this.game.physics.arcade.overlap(
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
      this.enemies.forEach(enemy => this.game.physics.arcade.overlap(
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
    this.enemies.forEach(enemy => this.game.physics.arcade.overlap(
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
    this.asteroids.forEach(asteroid => this.game.physics.arcade.overlap(
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
  }
}
