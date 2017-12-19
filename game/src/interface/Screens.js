const baseStyle = {
  font: 'Exo 2',
  fontSize: 110,
  fill: 'white',
  fontWeight: 900,
}

class BlinkingButtonLabel extends Phaser.Group {
  constructor(game, x, y, actionText) {
    super(game)

    const buttonOffset = 80
    const text = this.game.add.text(x, y, `PRESS          TO ${actionText}`, baseStyle)
    text.anchor.setTo(0.5, 0.5)
    const button = this.game.add.sprite(x - buttonOffset, y, 'red-button')
    button.anchor.setTo(0.5, 0.5)
    this.add(text)
    this.add(button)

    // Blinking
    const blinkDurationMillis = 1500
    this.blinkTimer = this.game.time.create()
    this.blinkTimer.loop(blinkDurationMillis, this.blink, this)
    this.blinkTimer.start()
  }

  blink() {
    this.visible = this.parent.visible && !this.visible
  }

  destroy() {
    this.blinkTimer.stop()
  }
}

export class StartScreen extends Phaser.Group {
  constructor(game) {
    super(game)

    // Logo
    const logo = this.create(this.game.world.centerX, this.game.world.centerY, 'logo')
    logo.anchor.setTo(0.5, 0.5)
    logo.scale.set(0.75 * this.game.scaleFactor, 0.75 * this.game.scaleFactor)

    // Label
    const x = this.game.world.centerX
    const y = this.game.world.centerY + logo.height * 0.8
    this.add(new BlinkingButtonLabel(game, x, y, 'START'))
  }
}

export class EndScreen extends Phaser.Group {
  constructor(game) {
    super(game)

    // <div class="GameOverInner hidden">
    //   <div class="GameOver-score">Score: 4582</div>
    //   <img class="GameOver-title"  src="./assets/gameover-text.png"/>
    //   <div class="GameInner-buttontext GameOver-cta">
    //   </div>
    // </div>

    // Score
    const x = this.game.world.centerX
    const y = this.game.world.centerY * 0.5
    const text = this.game.add.text(x, y, `SCORE: ${this.game.score}`, baseStyle)
    text.anchor.setTo(0.5, 0.5)

    // "Game over" text
    this.gameOverText = this.create(this.game.world.centerX, this.game.world.centerY, 'gameover-text')
    this.gameOverText.anchor.setTo(0.5, 0.5)
    setTimeout(this.addResetInstructions.bind(this), 4000)
  }

  addResetInstructions() {
    const x = this.game.world.centerX
    const y = this.game.world.centerY + this.gameOverText.height * 1.2
    this.add(new BlinkingButtonLabel(this.game, x, y, 'RESET'))
  }
}
