import constancts from './react/constancts'
import { createElement } from './react/React'
import { render } from './react/ReactDom'

const React = {
  createElement: createElement,
  render: render,
}

const container = document.getElementById('root')

export const App = () => {
  const a = 1
  return React.createElement('h1', {}, 123)
}

const div = React.createElement(
  'div',
  {},
  React.createElement(
    'div',
    {},
    React.createElement('h1', {}, 'h1'),
    React.createElement('h2', {}, 'h2'),
    React.createElement('h2', {}, 'h2'),
    React.createElement('h2', {}, 'h2'),
    React.createElement('h2', {}, 'h2'),
    React.createElement('h3', {}, 'h3'),
  ),
  React.createElement('h1', {}, 'h1'),
  React.createElement('h2', {}, 'h2'),
  React.createElement('h3', {}, 'h3'),
)

try {
  //React.render(React.createElement(App), container)
  React.render(div, container)
} catch (e) {
  console.log({ e })
}
