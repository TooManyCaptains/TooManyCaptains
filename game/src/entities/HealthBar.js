export default class HealthBar {
  constructor(ship, color = 0x30ee02) {
    this.ship = ship
    this.width = this.ship.width * 0.5
    this.height = 15 * ship.game.scaleFactor

    this.outline = ship.game.add.graphics()
    this.outline.beginFill(0xffffff, 1)
    this.outline.drawRoundedRect(0, 0, this.width, this.height, 50)

    this.bar = ship.game.add.graphics()
    this.bar.beginFill(color, 1)
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 50)
    this.bar.update = this.update.bind(this)
  }

  update() {
    const x = this.ship.centerX - this.width * 0.7
    let y = this.ship.y - this.ship.height * 0.85
    if (this.ship.key === 'player') {
      y = this.ship.y - this.ship.height * 0.5
    }
    this.bar.x = x
    this.bar.y = y
    this.outline.x = x
    this.outline.y = y
    this.bar.scale.x = Math.max(0, this.ship.health / this.ship.maxHealth)
    if (!this.ship.alive) {
      this.bar.destroy()
      this.outline.destroy()
    }
  }
}
