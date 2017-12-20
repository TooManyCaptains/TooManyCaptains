const baseStyle = {
  font: 'Exo 2',
  fontSize: 48,
  fill: 'white',
  fontWeight: 900,
  boundsAlignH: 'center',
  boundsAlignV: 'middle',
}


export default class Panel extends Phaser.Group {
  constructor(game, width, height, nameText, descriptionText = 'EFFECTIVE AGAINST') {
    super(game)
    const padding = 25
    const frame = game.add.graphics(0, 0, this)
    frame.lineStyle(2, 0xffffff)
    frame.drawRoundedRect(0, 0, width, height, 15)

    const bannerHeight = 70

    const banner = game.add.graphics(0, 0, this)
    banner.beginFill(0xffffff)
    banner.drawRect(0, padding, width, bannerHeight)
    banner.endFill()

    const text = game.add.text(0, 0, nameText, { ...baseStyle, fill: 'black' }, this)
    text.setTextBounds(0, padding, width, bannerHeight)

    if (descriptionText) {
      const desc = game.add.text(
        0,
        padding + bannerHeight,
        descriptionText,
        { ...baseStyle, fontSize: 34 },
        this,
      )
      desc.setTextBounds(0, 0, width, 100)
    }
  }
}
