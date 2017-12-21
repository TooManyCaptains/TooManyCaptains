export default class Asteroid extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, 'asteroid')

    this.collisionDamage = 35

    // Physics and movement
    this.anchor.setTo(0.5, 0.5)
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.movementSpeed = 90
    this.outOfBoundsKill = true
    this.checkWorldBounds = true
    this.body.velocity.x = -this.movementSpeed + (this.movementSpeed * (Math.random() / 5))

    const randScale = 1 + Math.random() / 2

    const scale = 0.6 * randScale
    this.scale.set(scale, scale)

    this.body.setSize(140, 145, 33.5, 30)
    this.sendToBack()
    this.body.angularVelocity = -30
  }

  kill() {
    this.game.score += 250
    super.kill()
  }

  // createExplosion() {
  //   this.exp = this.game.add.sprite(this.x, this.y, 'explosion')
  //   this.exp.anchor.setTo(0.5, 0.5)
  //   this.exp.animations.add('explosion')
  //   this.exp.play('explosion', 30, false, true)
  // }
}
