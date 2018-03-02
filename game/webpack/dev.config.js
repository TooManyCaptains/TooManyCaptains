const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./base.config');

baseConfig.mode = 'development';

baseConfig.plugins = [
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
