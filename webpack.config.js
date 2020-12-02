const path = require('path')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'public/assets'),
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: 'public',
    hot: true,
    hotOnly: true,
    publicPath: '/assets',
    port: 3001,
  },
}
