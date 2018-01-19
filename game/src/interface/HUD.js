import Panel from './Panel'

function colorNamesToColorKey(names) {
  const nameToKey = name => name[0].toUpperCase()
  return names.map(nameToKey, names).join('') || 'None'
}

class HealthBar {
  constructor(game, color = 0x30ee02) {
    this.game = game
    this.width = this.game.width * 0.7
    this.height = 50

    this.outline = game.add.graphics()
    this.outline.beginFill(0xffffff, 1)
    const border = 0
    this.outline.drawRoundedRect(border, border, this.width + border, this.height + border, 50)

    this.bar = game.add.graphics()
    this.bar.beginFill(color, 1)
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 75)
    this.bar.update = this.update.bind(this)
  }

  update() {
    this.bar.scale.x = Math.max(0, this.game.player.health / this.game.player.maxHealth)
  }
}


class ColorChart extends Phaser.Sprite {
  constructor(game, x, y, colorNames = []) {
    super(game, x, y)
    this.setColors(colorNames)
    this.anchor.setTo(0.5, 0.5)
    this.scale.setTo(1.25, 1.25)
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.angularVelocity = 75
  }

  setColors(colorNames = []) {
    const colorKey = colorNamesToColorKey(colorNames)
    // this.loadTexture(`ring_${colorKey}`)
    this.loadTexture(`ring-BRY`)
  }
}

class SubsystemIcon extends Phaser.Sprite {
  constructor(game, x, y, subsystem) {
    super(game, x, y)
    this.anchor.setTo(0.5, 1)
    this.scale.setTo(1.25, 1.25)
    this.loadTexture(`icon-${subsystem}`)
  }
}

class Battery extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y)
    this.anchor.setTo(0.5, 0.25)
    this.scale.setTo(1, 1)
    this.loadTexture(`battery-red`)
  }
}

class WeaponsPanel extends Panel {
  constructor(game, parent, width, height) {
    super(game, parent, width, height, 'WEAPONS')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)
    this.add(new Battery(game, this.centerX, this.centerY))
    const oldBottom = this.bottom
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask')
    mask.anchor.setTo(0.5, 0.75)
    mask.scale.setTo(1.5, 1.5)
    this.add(mask)

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'weapons')
    this.add(icon)

    this.colors = []
  }
  update() {
    const newColors = this.game.player.weaponColors
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors
      this.colorChart.setColors(this.colors)
    }
    super.update()
  }
}

class ShieldsPanel extends Panel {
  constructor(game, parent, width, height) {
    super(game, parent, width, height, 'SHIELDS')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)
    this.add(new Battery(game, this.centerX, this.centerY))
    const oldBottom = this.bottom
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask')
    mask.anchor.setTo(0.5, 0.75)
    mask.scale.setTo(1.5, 1.5)
    this.add(mask)

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'shields')
    this.add(icon)

    this.colors = []
  }
  update() {
    const newColors = this.game.player.weaponColors
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors
      this.colorChart.setColors(this.colors)
    }
    super.update()
  }
}

class PropulsionPanel extends Panel {
  constructor(game, parent, width, height) {
    super(game, parent, width, height, 'PROPULSION')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)
    this.add(new Battery(game, this.centerX, this.centerY))
    const oldBottom = this.bottom
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask')
    mask.anchor.setTo(0.5, 0.75)
    mask.scale.setTo(1.5, 1.5)
    this.add(mask)

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'propulsion')
    this.add(icon)

    this.colors = []
  }
  update() {
    const newColors = this.game.player.weaponColors
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors
      this.colorChart.setColors(this.colors)
    }
    super.update()
  }
}

class RepairsPanel extends Panel {
  constructor(game, parent, width, height) {
    super(game, parent, width, height, 'REPAIRS')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)
    this.add(new Battery(game, this.centerX, this.centerY))
    const oldBottom = this.bottom
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask')
    mask.anchor.setTo(0.5, 0.75)
    mask.scale.setTo(1.5, 1.5)
    this.add(mask)

    const icon = new SubsystemIcon(game, this.centerX, oldBottom, 'repairs')
    this.add(icon)

    this.colors = []
  }
  update() {
    const newColors = this.game.player.weaponColors
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors
      this.colorChart.setColors(this.colors)
    }
    super.update()
  }
}

export default class HUD extends Phaser.Group {
  constructor(game, x, y, width, height) {
    super(game, undefined, 'HUD')
    this.x = x
    this.y = y
    const hudPadding = width * 0.025
    const healthBar = new HealthBar(this.game)
    // this.add(healthBar)
    const panels = [WeaponsPanel, ShieldsPanel, PropulsionPanel, RepairsPanel]
    const bottom = this.bottom
    panels.forEach((Klass, i) => {
      const panel = new Klass(this.game, this, width * 0.19, bottom * 0.8)
      panel.x = (panel.width + hudPadding) * i + hudPadding
      panel.y = hudPadding
    })

    // game.server.socket.on('weapons', data => gameMainState.onWeaponsChanged(data))
  }
}
