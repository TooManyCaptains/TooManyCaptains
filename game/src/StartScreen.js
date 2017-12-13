export default class StartScreen extends Phaser.Group {
  constructor(game) {
    super(game)

    // Sprites
    const logo = this.create(this.game.world.centerX, this.game.world.centerY, 'logo')
    logo.anchor.setTo(0.5, 0.5)
    logo.scale.set(0.75 * this.game.scaleFactor, 0.75 * this.game.scaleFactor)

    this.textGroup = this.game.add.group()
    const textStyle = {
      font: `${110 * this.game.scaleFactor}px Exo 2`,
      fill: 'white',
      fontWeight: 900,
    }
    const x = this.game.world.centerX
    const y = this.game.world.centerY + logo.height * 0.8
    const buttonOffset = 80
    const text = this.game.add.text(x, y, 'PRESS          TO START', textStyle)
    text.anchor.setTo(0.5, 0.5)
    const button = this.game.add.sprite(x - buttonOffset, y, 'red-button')
    button.anchor.setTo(0.5, 0.5)
    this.textGroup.add(text)
    this.textGroup.add(button)

    // Blinking
    const blinkDurationMillis = 1500
    const blinkTimer = this.game.time.create()
    blinkTimer.loop(blinkDurationMillis, this.blink, this)
    blinkTimer.start()
  }

  blink() {
    this.textGroup.visible = this.visible && !this.textGroup.visible
  }

  foo() {
    // this.openFx.play()
    // const lipSize = 95
    // this.game.add.tween(this.doorLeft.position)
    //   .to({ x: -this.game.width / 2 - lipSize }, this.durationMillis, this.easing, true)
    // const animation = this.game.add.tween(this.doorRight.position)
    //   .to({ x: this.game.width }, this.durationMillis, this.easing, true)
    // animation.onComplete.add(callback)
  }
}
