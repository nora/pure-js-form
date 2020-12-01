const path = require('path')
module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/assets'),
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: 'public',
    hot: true,
    hotOnly: true,
    publicPath: 'assets',
    port: 3000,
  },
}
