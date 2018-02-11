const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');


const baseConfig = require('./base.config');

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
