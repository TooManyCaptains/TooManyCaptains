import Panel from './Panel'

export default class HUD extends Phaser.Group {
    constructor(game) {
      super(game)

    //   ['WEAPONS', 'SHIELDS', 'PROPULSION', 'REPAIRS'].forEach((name, i) => {
    //     const width = this.game.width * 0.22
    //     const height = this.game.height * 0.4
    //     const panel = new Panel(this.game, width, height, name)
    //     panel.x = (panel.width + hudPadding) * i + hudPadding
    //     panel.y = this.game.height / 2 + hudPadding
    //     this.game.add.existing(panel)
    //   })
    }
}
