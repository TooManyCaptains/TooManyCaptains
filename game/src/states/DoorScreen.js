import Doors from '../interface/Doors'

export default class Boot extends Phaser.State {

  preload() {

  }

  startGame() {
    this.gameState = 'start'
    this.game.server.notifyGameState(this.gameState)
    this.game.server.notifyReady()
  }


  create() {
    this.doors = this.game.add.existing(new Doors(this.game))
    this.doors.open(this.startGame.bind(this))
  }
}