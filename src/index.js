import constancts from './react/constancts'
import { App } from './App'
import { createElement } from './react/React'
import { render } from './react/ReactDom'

const container = document.getElementById('root')

try {
  render(createElement(App), container)
} catch (e) {
  console.log({ e })
}
