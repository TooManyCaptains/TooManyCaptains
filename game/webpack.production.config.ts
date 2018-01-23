import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HardSourceWebpackPlugin from 'hard-source-webpack-plugin';

import baseConfig from './webpack.base';

baseConfig.plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.bundle.js',
  }),
  new HtmlWebpackPlugin({
    template: 'index.html',
    minify: {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      html5: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      removeComments: true,
      removeEmptyAttributes: true,
    },
    hash: true,
  }),
  new UglifyJsPlugin({
    parallel: true,
    sourceMap: true,
    cache: true,
  }),
  new CopyWebpackPlugin([{ from: 'assets', to: 'assets' }]),
  new HardSourceWebpackPlugin(),
];

module.exports = baseConfig;
