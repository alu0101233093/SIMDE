const webpack = require('webpack');
const path = require('path');
const commonConfig = require('./webpack.common.js');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const webpackMerge = require('webpack-merge');
const ENV = 'dev';


module.exports = webpackMerge(commonConfig({ env: ENV }), {
   devServer: {
      contentBase: './target/www'
   },
   output: {
      path: path.resolve('target/www'),
      filename: '[name].bundle.js',
      chunkFilename: '[id].chunk.js'
   },
   plugins: [
      new BrowserSyncPlugin({
         host: 'localhost',
         port: 9000,
         proxy: {
            target: 'http://localhost:9060'
         }
      }, {
            reload: true
         })
   ]
});