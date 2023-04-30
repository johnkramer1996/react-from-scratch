import { createElement } from './react/React'
import { useEffect, useLayoutEffect, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setstate] = useState(1)
  const count = useRef(0)
  count.current++

  useEffect(() => {
    setstate((s) => s + 1)
    setstate((s) => s + 2)
    setstate((s) => s + 3)
    console.log('message 1')
  }, [])

  useLayoutEffect(() => {
    console.log('message 21')
  }, [])

  console.log('render', count)

  return createElement('div', {}, state)
}
