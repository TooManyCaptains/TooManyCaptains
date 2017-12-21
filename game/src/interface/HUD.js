import Panel from './Panel'

function colorNamesToColorKey(names) {
  const nameToKey = name => name[0].toUpperCase()
  return names.map(nameToKey, names).join('') || 'None'
}

class ColorChart extends Phaser.Sprite {
  constructor(game, x, y, colorNames = []) {
    super(game, x, y)
    this.setColors(colorNames)
    this.anchor.setTo(0.5, 0.15)
    this.scale.setTo(0.95, 0.95)
  }

  setColors(colorNames = []) {
    const colorKey = colorNamesToColorKey(colorNames)
    this.loadTexture(`attri_${colorKey}`)
  }
}

class WeaponsPanel extends Panel {
  constructor(game, width, height) {
    super(game, width, height, 'WEAPONS', 'EFFECTIVE AGAINST')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)

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
  constructor(game, width, height) {
    super(game, width, height, 'SHIELDS', 'PROTECTED FROM')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)

    this.colors = []
  }

  update() {
    const newColors = this.game.player.shieldColors
    // If shield colors changed, update the color chart
    if (this.colors.length !== newColors.length) {
      this.colors = newColors
      this.colorChart.setColors(this.colors)
    }
    super.update()
  }
}

class PropulsionPanel extends Panel {
  constructor(game, width, height) {
    super(game, width, height, 'PROPULSION')

    this.chart = this.create(this.centerX, this.centerY)
    this.chart.anchor.setTo(0.5, 0.33)

    this.level = 0
    this.setTextureForLevel()
  }

  update() {
    const newLevel = this.game.player.propulsionLevel
    // If shield colors changed, update the color chart
    if (this.level !== newLevel) {
      this.level = newLevel
      this.setTextureForLevel()
    }
    super.update()
  }

  setTextureForLevel() {
    this.chart.loadTexture(`propulsion-${this.level}`)
  }
}

class RepairsPanel extends Panel {
  constructor(game, width, height) {
    super(game, width, height, 'REPAIRS')

    this.chart = this.create(this.centerX, this.centerY)
    this.chart.anchor.setTo(0.5, 0.34)
    this.chart.scale.setTo(1.2, 1.2)

    this.level = 0
    this.setTextureForLevel()
  }

  update() {
    const newLevel = this.game.player.repairLevel
    // If shield colors changed, update the color chart
    if (this.level !== newLevel) {
      this.level = newLevel
      this.setTextureForLevel()
    }
    super.update()
  }

  setTextureForLevel() {
    this.chart.loadTexture(`repair-${this.level}`)
  }
}

export default class HUD extends Phaser.Group {
  constructor(game, x, y, width, height) {
    super(game)
    this.x = x
    this.y = y
    const hudPadding = width * 0.025
    const panels = [WeaponsPanel, ShieldsPanel, PropulsionPanel, RepairsPanel]
    panels.forEach((Klass, i) => {
      const panel = new Klass(this.game, width * 0.22, height * 0.8)
      panel.x = (panel.width + hudPadding) * i + hudPadding
      panel.y = hudPadding
      this.add(panel)
    })

    // game.server.socket.on('weapons', data => gameMainState.onWeaponsChanged(data))
  }
}
