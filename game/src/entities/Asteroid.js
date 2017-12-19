export default class Asteroid extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, 'asteroid')

    this.collisionDamage = 35

    // Physics and movement
    this.anchor.setTo(0.5, 0.5)
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.movementSpeed = 90
    this.body.velocity.x = -this.movementSpeed + (this.movementSpeed * (Math.random() / 5))

    const randScale = 1 + Math.random() / 2

    const scale = this.game.scaleFactor / 1.6 * randScale
    this.scale.set(scale, scale)

    this.y = Math.min(this.game.height / 2 - this.height / 2, this.y + this.height / 2)

    this.body.setSize(140, 145, 33.5, 30)
    this.sendToBack()
    this.body.angularVelocity = -30
  }

  update() {
    if (this.x <= 0) {
      this.game.score += 250
      this.destroy()
    }
  }

  // createExplosion() {
  //   this.exp = this.game.add.sprite(this.x, this.y, 'explosion')
  //   this.exp.anchor.setTo(0.5, 0.5)
  //   this.exp.animations.add('explosion')
  //   this.exp.play('explosion', 30, false, true)
  // }
}
