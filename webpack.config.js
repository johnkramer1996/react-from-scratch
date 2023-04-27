const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') // Импортируем плагин

let mode = 'development'
if (process.env.NODE_ENV === 'production') {
  mode = 'production'
}

const plugins = [
  new HtmlWebpackPlugin({
    template: './src/index.html', // Данный html будет использован как шаблон
  }),
] // Создаем массив плагинов

module.exports = {
  mode,
  plugins, // Сокращенная запись plugins: plugins в ES6+
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
    rules: [
      { test: /\.(html)$/, use: ['html-loader'] }, // Добавляем загрузчик для html
    ],
  },
}
