import constancts from './react/constancts'
import { App } from './App'
import { render } from './react/ReactDom'
import { createElement } from './react/React'

const container = document.getElementById('root')

try {
  render(createElement(App, { ref: '123' }), container)
} catch (e) {
  console.log({ e })
}
