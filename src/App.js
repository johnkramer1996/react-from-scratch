import { createElement } from './react/React'
import { useEffect, useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setstate] = useState(1)

  if (state === 1) {
    setstate((s) => s + 1)
  }

  useEffect(() => {
    console.log('message')
  }, [])

  return createElement(
    'div',
    {},
    createElement('h1', {}, state), //
    createElement('button', {}, 'count'),
  )
}
