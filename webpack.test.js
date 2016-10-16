const path = require('path');

const config = {
  entry: path.join(__dirname, 'tests/JsonApiStore.test.js'),
  output: {
    filename: 'test.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    loaders: [{
      test: /.js$/,
      loader: 'babel'
    }]
  },
  plugins: [],
  externals: {
    mobx: 'commonjs mobx',
    mocha: 'commonjs mocha',
    chai: 'commonjs chai'
  },
  devtool: 'cheap-module-source-map'
};

module.exports = config;
