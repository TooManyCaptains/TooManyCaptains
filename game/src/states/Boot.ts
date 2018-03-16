import { Game } from '../index';

export default class Boot extends Phaser.State {
  public game: Game;

  public create() {
    // Scale the game to fill the entire page.
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // Don't pause the game on blur.
    this.game.stage.disableVisibilityChange = true;

    // Disable clearing the canvas on each tick (usually not needed).
    this.game.clearBeforeRender = false;

    // Disable right click.
    this.game.canvas.oncontextmenu = e => e.preventDefault();

    // Move on to the preload state.
    this.game.state.start('Preload');
  }
}
