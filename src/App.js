import { createElement } from './react/React'
import { useEffect, useLayoutEffect, useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setstate] = useState(1)

  useEffect(() => {
    console.log('message 1')
  })

  useLayoutEffect(() => {
    console.log('message 21')
  })

  console.log('123')

  return createElement('div', {}, state)
}
