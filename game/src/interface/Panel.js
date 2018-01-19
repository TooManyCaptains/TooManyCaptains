const baseStyle = {
  font: 'Exo 2',
  fontSize: 27,
  fill: 'white',
  fontWeight: 900,
  boundsAlignH: 'center',
  boundsAlignV: 'middle',
}

export default class Panel extends Phaser.Group {
  constructor(game, parent, width, height, nameText = '') {
    super(game, parent, `panel-${nameText}`)
    const frame = game.add.graphics(0, 0, this)
    frame.lineStyle(2, 0xffffff)
    frame.beginFill(0, 1)
    frame.drawCircle(width / 2, height / 2, width)

    const text = game.add.text(0, 0, nameText, baseStyle, this)
    text.setTextBounds(0, 85, width, 40)
  }
}
