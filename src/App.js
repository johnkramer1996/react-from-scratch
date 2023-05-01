import { createElement } from './react/React'
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  // const [state, setstate] = useState(1)
  const [stateReducer, dispatch] = useReducer((state, action) => action(state), 1)

  const count = useRef(0)
  count.current++

  useEffect(() => {
    dispatch((s) => s + 1)
    //dispatch((s) => s + 2)
    //dispatch((s) => s + 3)
    console.log('message 1')
  }, [])

  useLayoutEffect(() => {
    console.log('message 21')
  }, [])

  console.log('render', count)

  return createElement('h1', { style: { color: count.current === 1 ? 'red' : 'green' } }, 1, 1)
}
