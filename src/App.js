import { Memo } from './components/Memo'
import { Parent } from './components/Parent'
import { ThemeContext } from './components/ThemeContext'
import { createElement } from './react/React'
import { useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setState] = useState([
    { id: 1, name: 'name 1' },
    { id: 2, name: 'name 2' },
    { id: 3, name: 'name 3' },
    { id: 4, name: 'name 4' },
    { id: 5, name: 'name 5' },
  ])
  const [state2, setState2] = useState(0)
  const prevValue = useRef(state2)

  return createElement(
    'div',
    null,
    state.map((i) =>
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
      createElement('div', null, createElement(Parent, {}, state2)),
    ),
  )
}
