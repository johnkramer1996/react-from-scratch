const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let mode = 'development'
if (process.env.NODE_ENV === 'production') {
  mode = 'production'
}

const plugins = [
  new HtmlWebpackPlugin({
    template: './src/index.html',
  }),
]

module.exports = {
  mode,
  plugins,
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  devServer: {
    hot: true,
  },

  module: {
    rules: [{ test: /\.(html)$/, use: ['html-loader'] }],
  },
}
