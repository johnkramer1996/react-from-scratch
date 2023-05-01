import { Memo } from './components/Memo'
import { Parent } from './components/Parent'
import { ThemeContext } from './components/ThemeContext'
import { createElement } from './react/React'
import { useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  console.log('render App')
  const [state, setState] = useState([
    { id: 1, name: 'name 1' },
    { id: 2, name: 'name 2' },
    { id: 3, name: 'name 3' },
    { id: 4, name: 'name 4' },
    { id: 5, name: 'name 5' },
  ])
  const [state2, setState2] = useState(0)
  const ref = useRef()
  const prevValue = useRef(state2)

  useLayoutEffect(() => {
    console.log('App useEffect')

    return () => console.log('unmount App useEffect')
  })

  const onClick = useMemo(
    () => () => {
      setState2(state2)
    },
    [],
  )

  return createElement(
    'div',
    null,
    state.map((i, index) =>
      createElement(
        'div',
        {
          key: i.id,
          onClick: () => {
            setState2((prev) => prev + 1)
            prevValue.current = state2
          },
        },
        i.name,
      ),
    ),
    createElement(Memo, null, 1),
    createElement(
      ThemeContext.Provider,
      { value: state2 },
      createElement('div', null, createElement(Parent, { onClick }, state2)),
    ),
    createElement(ThemeContext.Consumer, null, (props) => 'привет мир' + JSON.stringify(props)),
  )
}
