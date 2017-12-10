import HealthBar from './HealthBar'
import { Weapon } from './Weapon'

const toDegrees = radians => radians * 180 / Math.PI

// DONT USE
export class PatrolEnemy extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, 'enemy')

    this.anchor.setTo(0.5, 0.5)
    this.scale.set(this.game.scaleFactor, this.game.scaleFactor)

    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.movementSpeed = 5
  }

  update() {
    this.game.physics.arcade.moveToObject(this, this.game.player, this.movementSpeed)
    let degreesBetween = toDegrees(this.game.physics.arcade.angleBetween(this, this.game.player))
    if (degreesBetween < 0) {
      degreesBetween = 180 - Math.abs(degreesBetween)
    } else {
      degreesBetween = Math.abs(degreesBetween) - 180
    }
    this.body.angularVelocity = degreesBetween - this.body.rotation
  }
}


export class Enemy extends Phaser.Sprite {
  constructor(game, x, y, type = 'R', weaponType = 'R') {
    super(game, x, y, `enemy_${type}${weaponType}`)
    this.animations.add('move')
    this.animations.play('move', 15, true)

    this.type = type
    this.weaponType = weaponType

    // Size and anchoring
    this.scaleFactor = this.game.scaleFactor
    this.anchor.setTo(0.5, 0.5)
    this.scale.y = this.scaleFactor
    this.scale.x = this.scaleFactor

    // Health
    this.health = 20
    this.maxHealth = this.health
    this.healthBar = new HealthBar(this)

    // Weapon
    const baseFiringRate = 10000
    this.bulletDamage = 17.5
    this.weapon = new Weapon(this, this.bulletDamage, weaponType)
    this.fireTimer = this.game.time.create()
    this.fireTimer.loop(baseFiringRate + (baseFiringRate * Math.random()), () => this.fire())
    this.fireTimer.start()

    // Death
    this.events.onKilled.add(this.onKilled.bind(this), this)
    this.collisionDamage = 35

    // Physics and movement
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.movementSpeed = 5
    this.verticalDriftSpeed = this.movementSpeed / 2
    this.body.velocity.x = -this.movementSpeed + (this.movementSpeed * Math.random())
    this.body.velocity.y = Math.random() > 0.5 ? this.verticalDriftSpeed : -this.verticalDriftSpeed

    // Hitbox size adjustment
    this.body.setSize(102, 38, 13.5, 12.5)

    // // Fire when created
    // this.fire()
    this.explosionFx = this.game.add.audio('explosion')
  }

  onKilled() {
    this.game.score += 150
    this.fireTimer.stop()
    this.createExplosion()
    this.explosionFx.play()
  }

  getHurtTint() {
    this.tint = 0xff0000
    setTimeout(() => this.tint = 0xffffff, 150)
  }

  createExplosion() {
    this.exp = this.game.add.sprite(this.x, this.y, 'explosion')
    this.exp.anchor.setTo(0.5, 0.5)
    this.exp.animations.add('explosion')
    this.exp.play('explosion', 30, false, true)
  }

  update() {
    // Drift vertically
    if (this.y - this.height < 0) {
      this.body.velocity.y = this.verticalDriftSpeed
    } else if (this.y + this.height > this.game.height) {
      this.body.velocity.y = -this.verticalDriftSpeed
    }
    // if (Math.random() < 0.0005) {
    //   if (this.y > this.game.height / 2) {
    //     this.body.velocity.y = -this.verticalDriftSpeed
    //   } else {
    //     this.body.velocity.y = this.verticalDriftSpeed
    //   }
    // }
  }

  fire() {
    this.weapon.fire()
  }
}
