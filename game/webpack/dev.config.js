const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./base.config');

baseConfig.plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.bundle.js',
  }),
  new HtmlWebpackPlugin({
    template: 'index.html',
  }),
];

baseConfig.devServer = {
  open: true,
  port: 3000,
  compress: true,
  progress: true,
};

module.exports = baseConfig;
