declare module 'phaser-webpack-loader' {
  import loader = require('phaser-webpack-loader');

  class WebpackLoader extends Phaser.Plugin {
    init(manifest: Object, postfix: string): void;
    load(): Promise<any>;
  }

  export = WebpackLoader;
}
