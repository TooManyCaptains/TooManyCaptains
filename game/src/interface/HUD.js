import Panel from './Panel'

const baseStyle = {
  font: 'Exo 2',
  fontSize: 40,
  fill: 'white',
  fontWeight: 800,
  boundsAlignH: 'center',
  boundsAlignV: 'middle',
}

function colorNamesToColorKey(names) {
  const nameToKey = name => name[0].toUpperCase()
  return names.map(nameToKey, names).join('') || 'None'
}

class HealthBar {
  constructor(game, parent, width = 100, height = 20, color = 0x30ee02, text = 'YOLO', value = 0.75) {
    this.game = game
    this.width = width
    this.height = height

    this.value = value

    this.outline = game.add.graphics()
    this.outline.beginFill(0x999999, 1)
    const border = 0
    this.outline.drawRoundedRect(border, border, this.width + border, this.height + border, 25)
    parent.add(this.outline)

    this.bar = game.add.graphics()
    this.bar.beginFill(color, 1)
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 25)
    this.bar.update = this.update.bind(this)
    parent.add(this.bar)

    this.text = game.add.text(0, 0, text, { ...baseStyle, fontSize: 28, boundsAlignH: 'center', fontWeight: 600, fill: 'black' })
    this.text.setTextBounds(0, 0, this.width, this.height + 2)
    parent.add(this.text)
  }

  set x(x) {
    this.bar.x = x
    this.outline.x = x
    this.text.x = x
  }

  set y(y) {
    this.bar.y = y
    this.outline.y = y
    this.text.y = y
  }

  update() {
    this.bar.scale.x = this.value
  }
}


class ColorChart extends Phaser.Sprite {
  constructor(game, x, y, colorNames = []) {
    super(game, x, y)
    this.setColors(colorNames)
    this.anchor.setTo(0.5, 0.5)
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
    this.loadTexture(`icon-${subsystem}`)
  }
}

class Battery extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y)
    this.anchor.setTo(0.5, 0.25)
    this.scale.setTo(0.9, 0.9)
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
    // mask.scale.setTo(1.5, 1.5)
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
    // mask.scale.setTo(1.5, 1.5)
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
    super(game, parent, width, height, 'THRUSTERS')

    this.colorChart = new ColorChart(game, this.centerX, this.centerY)
    this.add(this.colorChart)
    this.add(new Battery(game, this.centerX, this.centerY))
    const oldBottom = this.bottom
    const mask = this.game.add.sprite(this.centerX, this.bottom, 'icon-mask')
    mask.anchor.setTo(0.5, 0.75)
    // mask.scale.setTo(1.5, 1.5)
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
    // mask.scale.setTo(1.5, 1.5)
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

class CaptainsLog extends Phaser.Group {
  constructor(game, parent, width, height) {
    super(game, parent, 'CaptainsLog')
    const box = game.add.graphics()
    box.lineStyle(2, 0xffffff, 1)
    box.drawRoundedRect(0, 0, width, height, 20)
    this.add(box)

    const titleTextMargin = 10

    const text = game.add.text(0, 0, `${2} CAPTAINS ONBOARD`, baseStyle, this)
    text.setTextBounds(0, titleTextMargin, width, 50)

    const line = game.add.graphics()
    line.lineStyle(2, 0xffffff, 1)
    line.drawRect(titleTextMargin * 2, text.bottom + titleTextMargin, width - (titleTextMargin * 4), 1)
    this.add(line)

    const names = ['AVI', 'DAE', 'KEL', 'ANU', 'EMA', 'LIV']
    const nameTextSize = 30
    names.forEach((name, i) => {
      const x = 22
      const y = 80 + 43 * i
      const circle = game.add.graphics()
      const circleSize = 33
      circle.lineStyle(2, 0xffffff)
      circle.drawCircle(x + (circleSize / 2), y + 25, circleSize)
      this.add(circle)
      const nameText = game.add.text(0, 0, `CAPT. ${name}`, { ...baseStyle, fontSize: nameTextSize, boundsAlignH: 'left', fontWeight: 600 }, this)
      nameText.setTextBounds(x + (circle.width) + 11, y, 200, 50)

      const n = i + 1

      let nudge = -9
      if (n === 1) {
        nudge += 3
      } else if (n === 3) {
        nudge += 2
      } else if (n === 5) {
        nudge += 1
      }
      const numberText = game.add.text(0, 0, `${n}`, { ...baseStyle, fontSize: 25, boundsAlignH: 'left', fontWeight: 600 }, this)
      numberText.setTextBounds(x + (circle.width / 2) + nudge, y + 2, 200, 50)

      const yellow = 0xFCEE21
      const green = 0x7AC943
      let color = yellow
      let text = 'RECHARGING'

      if (n === 1) {
        color = green
        text = 'FULLY CHARGED'
      }
      const healthBar = new HealthBar(this.game, this, 315, 30, color, text)
      healthBar.y = y + 6
      healthBar.x = 230
    })
  }
}

export default class HUD extends Phaser.Group {
  constructor(game, x, y, width, height) {
    super(game, undefined, 'HUD')
    this.x = x
    this.y = y
    const innerPadding = 20
    const sidePadding = 40
    // const healthBar = new HealthBar(this.game)
    // this.add(healthBar)
    const bottom = this.bottom
    this.panels = [WeaponsPanel, ShieldsPanel, PropulsionPanel, RepairsPanel].map((Klass, i) => {
      const panel = new Klass(this.game, this, 300, 300)
      panel.x = sidePadding + (panel.width + innerPadding) * i
      panel.y = innerPadding
      return panel
    })
    const lastPanel = this.panels[this.panels.length - 1]

    const captainsLog = new CaptainsLog(this.game, this, 565, 360)
    captainsLog.x = lastPanel.right + innerPadding
    captainsLog.y = innerPadding
  }
}
