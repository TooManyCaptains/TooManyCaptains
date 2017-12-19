const toDegrees = radians => radians * 180 / Math.PI

class Beam extends Phaser.Sprite {
  constructor(game, key) {
    super(game, 0, 0, key)
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST
    this.anchor.set(0.5)
    this.checkWorldBounds = true
    this.outOfBoundsKill = true
    this.exists = false
    this.scale.set(this.game.scaleFactor * 1.5, this.game.scaleFactor * 1.5)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.setSize(28, 3.5, 15.5, 15.5)
  }

  fire(x, y, angle, speed) {
    this.reset(x, y)
    this.angle = angle
    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity)
  }
}

export class Weapon extends Phaser.Group {
  constructor(ship, bulletDamage = 10, bulletColor = 'R', yOffset = 0, angle = 0) {
    super(ship.game, ship.game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE)
    this.ship = ship

    this.bulletColor = bulletColor

    this.nextFire = 0
    this.bulletDamage = bulletDamage
    this.bulletVelocity = 200
    this.bulletVelocity = -this.bulletVelocity
    this.fireRate = 250
    this.yOffset = yOffset

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200)
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200))

    for (let i = 0; i < 64; i++) {
      const bullet = new Beam(this.game, `beam_${bulletColor}`)
      bullet.angle = angle
      bullet.color = bulletColor
      this.add(bullet, true)
    }
  }

  fire() {
    if (this.game.time.time < this.nextFire) return false

    const x = this.ship.x
    const y = this.ship.y + this.yOffset

    const angleToPlayer = toDegrees(this.game.physics.arcade.angleToXY(this.game.player, x, y))
    this.getFirstExists(false).fire(x, y, angleToPlayer, this.bulletVelocity, 0, 600)
    this.nextFire = this.game.time.time + this.fireRate
    return true
  }
}

class Bullet extends Phaser.Sprite {
  constructor(game, key) {
    super(game, 0, 0, key)
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST
    this.anchor.set(0.5)
    this.checkWorldBounds = true
    this.outOfBoundsKill = true
    this.exists = false
    const scale = this.game.scaleFactor * 0.25
    this.scale.set(scale, scale)
    this.scale.x = -this.scale.x
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.setSize(350, 100, 0, 25)
    this.damage = 0
  }

  fire(x, y, speed, strength) {
    this.reset(x, y)
    this.angle = 0
    this.damage = 50 * strength
    const scale = this.game.scaleFactor * 0.25 * (1 + strength * 1.5)
    console.log(`bullet damage: ${this.damage}`)
    this.scale.set(scale, scale)
    this.game.physics.arcade.velocityFromAngle(this.angle, speed, this.body.velocity)
  }
}

export class PlayerWeapon extends Phaser.Group {
  constructor(ship, bulletDamage = 10, color = 'R') {
    super(ship.game, ship.game.world, 'Player Bullet', false, true, Phaser.Physics.ARCADE)
    this.ship = ship

    this.color = color

    this.nextFire = 0
    this.bulletVelocity = 400
    this.bulletVelocity = this.bulletVelocity
    this.fireRate = 100

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200)
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200))

    for (let i = 0; i < 64; i++) {
      const bullet = new Bullet(this.game, `bullet_shoot_${color}`)
      bullet.color = color
      this.add(bullet, true)
    }
  }

  fire(strength) {
    if (this.game.time.time < this.nextFire) return false
    console.info(`firing with strength: ${strength}`)

    const x = this.ship.x + this.ship.width / 2
    const y = this.ship.y

    this.getFirstExists(false).fire(x, y, this.bulletVelocity, strength)
    this.nextFire = this.game.time.time + this.fireRate
    return true
  }
}
