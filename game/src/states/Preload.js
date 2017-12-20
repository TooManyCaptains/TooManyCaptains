import WebpackLoader from 'phaser-webpack-loader'
import AssetManifest from '../../AssetManifest'

const baseStyle = {
  font: 'Exo 2',
  fontSize: 110,
  fill: 'white',
  fontWeight: 900,
}

/**
 * Preload the game and display the loading screen.
 */
export default class Preload extends Phaser.State {
  /**
   * Once loading is complete, switch to the main state.
   */
  create() {
    // Determine which postfix to use on the assets based on the DPI.
    const postfix = ''
    // if (window.devicePixelRatio >= 3) {
    //   postfix = '@3x'
    // } else if (window.devicePixelRatio > 1) {
    //   postfix = '@2x'
    // }

    // Fix CORS issues with the loader and allow for unlimited parallel downloads.
    this.game.load.crossOrigin = 'anonymous'
    this.game.load.maxParallelDownloads = Infinity

    // Begin loading all of the assets.
    this.game.plugins.add(WebpackLoader, AssetManifest, postfix)
      .load()
      .then(() => {
        this.game.state.start('Before')
      })
    this.text = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY,
      '...',
      baseStyle,
    )
  }

  /**
   * Update the loading display with the progress.
   */
  update() {

  }
}
