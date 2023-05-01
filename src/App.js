import { REACT_FRAGMENT_TYPE, createElement, forwardRef, memo } from './react/React'
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from './react/renderWithHooks'

export const App = memo((props, ref) => {
  console.log(ref)
  // const [state, setstate] = useState(1)
  const [stateReducer, dispatch] = useReducer((state, action) => action(state), 1)

  const count = useRef(0)
  count.current++

  useEffect(() => {
    dispatch((s) => s + 1)
    console.log('message 1')
  }, [])

  useLayoutEffect(() => {
    console.log('message 21')
  }, [])

  console.log('render', count)

  const onClick = (event) => {
    console.log('click')
  }

  return createElement(
    REACT_FRAGMENT_TYPE,
    {},
    createElement(
      'h1',
      { onClick, style: { color: count.current === 1 ? 'red' : 'green' } },
      1,
      createElement(REACT_FRAGMENT_TYPE, {}, 123),
    ),
  )
})
