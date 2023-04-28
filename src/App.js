import { createElement } from './react/React'

export const App = () => {
  return createElement(
    'div',
    {},
    createElement('h1', {}, 'h1'),
    createElement('h2', {}, 'h2'),
    createElement('h3', {}, 'h3'),
  )
}
