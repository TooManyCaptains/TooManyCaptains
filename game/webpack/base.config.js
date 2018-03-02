const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Phaser webpack config
const phaserModule = path.join(__dirname, '../node_modules/phaser-ce/');
const phaser = path.join(phaserModule, './build/custom/phaser-split.js');
const pixi = path.join(phaserModule, './build/custom/pixi.js');
const p2 = path.join(phaserModule, './build/custom/p2.js');

const src = path.join(__dirname, '../src');

module.exports = {
  entry: `${src}/index.ts`,

  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname + '/../dist'),
  },

  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         test: /node_modules\//,
  //         name: 'vendor',
  //         chunks: 'all',
  //       },
  //     },
  //   },
  // },

  devtool: 'inline-source-map',

  plugins: [],

  stats: {
    // Nice colored output
    colors: true,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
    modules: false,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!phaser-webpack-loader)/,
        loader: 'babel-loader',
        include: src,
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]',
        },
      },
      {
        test: /\.(ogg|mp3|wav|mpe?g)$/,
        loader: 'file-loader',
        options: {
          name: 'audio/[name].[ext]',
        },
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
      { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
      { test: /p2\.js/, use: ['expose-loader?p2'] },
      { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.json'],
    alias: {
      phaser,
      pixi,
      p2,
      assets: path.join(__dirname, '../assets'),
    },
  },
};
