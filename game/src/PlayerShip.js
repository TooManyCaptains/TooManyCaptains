import { clamp } from 'lodash'
import { PlayerWeapon } from './Weapon'
import HealthBar from './HealthBar'

export default class PlayerShip extends Phaser.Sprite {
  constructor(game) {
    super(game, 125 * game.scaleFactor, game.height / 2, 'player')
    this.animations.add('move')
    this.animations.play('move', 20, true)

    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5, 0.5)

    this.scale.set(this.game.scaleFactor * 1, this.game.scaleFactor)

    // Set hitbox size
    this.body.setSize(165.4, 63.2, 25.8, 28.4)

    // Movement
    this.movementSpeed = 0
    this.body.collideWorldBounds = true
    this.propulsionLevel = 0

    // Shields
    this.shieldColors = []
    this.shield = game.add.sprite(this.x, this.y, 'shield_R')
    this.setShields(this.shieldColors)
    this.shield.anchor.setTo(0.5, 0.5)
    game.physics.enable(this.shield, Phaser.Physics.ARCADE)

    // Health
    this.maxHealth = 100
    this.health = 100

    // HP bar
    this.healthBar = new HealthBar(this)

    // Weapons
    this.weapon = null
    this.timeChargingStarted = 0
    const x = this.x + this.width / 2
    const y = this.y
    this.growingBullet = this.game.add.sprite(x, y)
    this.growingBullet.anchor.setTo(0.5, 0.5)
    this.growingBullet.update = () => {
      const scale = this.game.scaleFactor * 0.25 * (1 + this.weaponCharge * 1.5)
      this.growingBullet.scale.setTo(scale, scale)
      this.growingBullet.y = this.y
    }

    // Sound effects
    this.shootFx = this.game.add.audio('shoot')
    this.moveSlowFx = this.game.add.audio('move_slow')
    this.moveFastFx = this.game.add.audio('move_fast')
    this.chargingFx = this.game.add.audio('charging')

    // Repairs
    this.repairPercentagePerSecond = 0
    this.repairIntervalMsec = 250
    setInterval(this.onRepair.bind(this), this.repairIntervalMsec)
  }

  get weaponCharge() {
    const maxCharge = 4000
    return clamp(Date.now() - this.timeChargingStarted, 100, maxCharge) / maxCharge
  }

  onRepair() {
    this.heal((this.repairPercentagePerSecond * this.maxHealth) * (this.repairIntervalMsec / 1000))
  }

  setShields(colors) {
    colors.sort()
    this.shieldColors = colors
    if (colors.length === 0) {
      this.shield.exists = false
      return
    }
    this.shield.visible = true
    const colorToWeaponType = color => color[0].toUpperCase()
    const shieldKey = `shield_${colors.map(colorToWeaponType).join('')}`
    this.shield.loadTexture(shieldKey)
  }

  setWeapons(colors) {
    colors.sort()
    const colorToWeaponType = color => color[0].toUpperCase()
    if (colors.length === 0) {
      this.weapon = null
      this.stopChargingWeaponAndFireIfPossible()
    } else {
      this.weapon = new PlayerWeapon(
        this,
        this.weaponDamage,
        colors.map(colorToWeaponType).join(''),
      )
    }
  }

  fireWeapon() {
    if (!this.weapon) {
      return
    }
    this.weapon.fire(this.weaponCharge)
    this.shootFx.play()
  }

  startChargingWeapon() {
    if (!this.weapon) { return }
    this.timeChargingStarted = Date.now()
    this.growingBullet.loadTexture(`bullet_${this.weapon.color}`)
    this.growingBullet.visible = true
    this.chargingFx.play()
  }

  stopChargingWeaponAndFireIfPossible() {
    this.chargingFx.stop()
    this.growingBullet.visible = false
    if (this.weapon) {
      this.fireWeapon()
    }
  }

  startMovingDown() {
    // Can't move up with 0 propulsion
    if (this.propulsionLevel === 0) {
      return
    }
    this.body.velocity.y = this.movementSpeed
    if (this.propulsionLevel === 1) {
      this.moveFastFx.play()
    } else if (this.propulsionLevel === 2) {
      this.moveSlowFx.play()
    }
  }

  startMovingUp() {
    // Can't move up with 0 propulsion
    if (this.propulsionLevel === 0) {
      return
    }
    this.body.velocity.y = -this.movementSpeed
    if (this.propulsionLevel === 1) {
      this.moveFastFx.play()
    } else if (this.propulsionLevel === 2) {
      this.moveSlowFx.play()
    }
  }

  stopMoving() {
    this.body.velocity.y = 0
    this.moveFastFx.stop()
    this.moveSlowFx.stop()
  }

  getHurtTint() {
    this.tint = 0xff0000
    setTimeout(() => this.tint = 0xffffff, 150)
    const h = setInterval(() => this.tint = 0xffffff, 100)
    setTimeout(() => clearInterval(h), 500)
  }

  setPropulsionLevel(level) {
    this.propulsionLevel = level
    const levelSpeedMap = [0, 25, 100]
    this.movementSpeed = levelSpeedMap[level]
    if (this.movementSpeed === 0) {
      this.stopMoving()
    }
  }

  setRepairLevel(level) {
    const repairSpeedMap = [0, 0.015, 0.025, 0.065]
    this.repairPercentagePerSecond = repairSpeedMap[level]
  }

  update() {
    if (this.health !== this.prevHealth) {
      this.game.onHullStrengthChanged(this.health)
      this.prevHealth = this.health
    }

    // Shield
    this.shield.x = this.x
    this.shield.y = this.y
  }
}
