import { createElement } from './react/React'
import { useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setstate] = useState(1)

  if (state === 1) {
    setTimeout(() => {
      setstate((s) => s + 1)
    })
  }

  return createElement(
    'div',
    {},
    createElement('h1', {}, state), //
    createElement('button', {}, 'count'),
  )
}
