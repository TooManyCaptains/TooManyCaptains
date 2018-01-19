const baseStyle = {
  font: 'Exo 2',
  fontSize: 34,
  fill: 'white',
  fontWeight: 900,
  boundsAlignH: 'center',
  boundsAlignV: 'middle',
}


export default class Panel extends Phaser.Group {
  constructor(game, parent, width, height, nameText = '') {
    super(game, parent, `panel-${nameText}`)
    const padding = 125
    const frame = game.add.graphics(0, 0, this)
    frame.lineStyle(2, 0xffffff)
    frame.drawCircle(width / 2, height / 2, width)

    const bannerHeight = 70

    const text = game.add.text(0, 0, nameText, baseStyle, this)
    text.setTextBounds(0, padding, width, bannerHeight)
  }
}
