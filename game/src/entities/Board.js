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

    // Asteroids
    this.asteroids = new Phaser.Group(this.game, undefined, 'asteroids')
    this.add(this.asteroids)

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
    this.enemies = new Phaser.Group(this.game, undefined, 'enemies')
    const numStartingEnemies = 3
    _.times(numStartingEnemies, i => {
      this.spawnEnemy(height / numStartingEnemies * (i + 1) - (height / numStartingEnemies / 2))
    })
    this.add(this.enemies)
  }

  spawnEnemy(y) {
    const x = this.maxX
    if (y === undefined) {
      y = this.maxY * Math.random()
    }
    const colors = 'RYB'.split('')
    const allEnemyTypes = _.flatten(colors.map(a => colors.map(b => a + b)))
    const randomEnemyType = _.sample(allEnemyTypes)
    this.enemies.add(new Enemy(this.game, x, y, ...randomEnemyType))
  }

  spawnAsteroid() {
    const x = this.maxX
    const y = this.maxY * Math.random()
    this.asteroids.add(new Asteroid(this.game, x, y))
  }

  update() {
    super.update()
    this.scoreText.text = `SCORE: ${this.game.score}`

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
    ))

    // Planet <-> enemy bullet collision
    if (this.player.weapon) {
      this.game.physics.arcade.overlap(
        this.planet,
        this.player.weapon,
        (planet, bullet) => {
          bullet.kill()
        },
      )
    }

    // Enemy <-> player bullet collision
    if (this.player.weapon) {
      this.game.physics.arcade.overlap(
        this.enemies,
        this.player.weapon,
        (enemy, bullet) => {
          const playerBulletCanHurtEnemy = bullet.color.includes(enemy.type)
          // Bullet hits
          if (playerBulletCanHurtEnemy) {
            enemy.getHurtTint()
            enemy.damage(bullet.damage)
            if (!enemy.isAlive) {
              enemy.explode()
              this.game.score += 150
            }
          } else {
            this.shieldFx.play()
          }
          bullet.kill()
        },
      )
    }

    // Enemy <-> player ship (no shield) collision
    this.game.physics.arcade.overlap(
      this.enemies,
      this.player,
      (enemy, player) => {
        enemy.destroy()
        player.getHurtTint()
        player.damage(enemy.collisionDamage)
      },
    )

    // Enemy <-> enemy collision
    this.game.physics.arcade.collide(this.enemies, this.enemies)

    // Player <-> asteroid collision
    this.game.physics.arcade.overlap(
      this.asteroids,
      this.player,
      (player, asteroid) => {
        asteroid.destroy()
        player.getHurtTint()
        player.damage(asteroid.collisionDamage)
        this.collideFx.play()
      },
    )
  }
}
