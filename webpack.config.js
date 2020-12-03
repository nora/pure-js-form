const path = require('path')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'docs/assets'),
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: 'docs',
    hot: true,
    hotOnly: true,
    publicPath: '/assets',
    port: 3000,
  },
}
