import { EndScreen } from '../interface/Screens'
import Doors from '../interface/Doors'

export default class Boot extends Phaser.State {
  create() {
    this.doors = this.game.add.existing(new Doors(this.game))
    this.screen = this.game.add.existing(new EndScreen(this.game))
  }
}