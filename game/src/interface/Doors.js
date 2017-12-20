export default class Doors extends Phaser.Group {
  constructor(game, isInitiallyOpened = false) {
    super(game)

    const lipSize = 95
    this.leftOpenX = -this.game.width / 2 - lipSize
    this.rightOpenX = this.game.width

    // Sprites
    if (isInitiallyOpened) {
      this.doorLeft = this.create(this.leftOpenX, -1, 'door-left')
      this.doorRight = this.create(this.rightOpenX, 0, 'door-right')
    } else {
      this.doorLeft = this.create(0, -1, 'door-left')
      this.doorRight = this.create(this.game.width / 2, 0, 'door-right')
    }

    // Sounds
    this.openFx = this.game.add.audio('doors_open')
    this.closeFx = this.game.add.audio('doors_close')

    // Animation
    this.durationMillis = game.config.skip ? 1 : 1700
    this.easing = Phaser.Easing.Quadratic.InOut
  }

  open(callback) {
    this.openFx.play()
    this.game.add.tween(this.doorLeft.position)
      .to({ x: this.leftOpenX }, this.durationMillis, this.easing, true)
    const animation = this.game.add.tween(this.doorRight.position)
      .to({ x: this.rightOpenX }, this.durationMillis, this.easing, true)
    animation.onComplete.add(callback)
  }

  close(callback) {
    this.closeFx.play()
    this.game.add.tween(this.doorLeft.position)
      .to({ x: 0 }, this.durationMillis, this.easing, true)
    const animation = this.game.add.tween(this.doorRight.position)
      .to({ x: this.game.width / 2 }, this.durationMillis, this.easing, true)
    animation.onComplete.add(callback)
  }
}
