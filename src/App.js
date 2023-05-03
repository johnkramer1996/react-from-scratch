import { Parent } from './components/Parent'
import { ThemeContext } from './components/ThemeContext'
import { createElement, memo } from './react/React'
import { useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setState] = useState([
    // { id: 1, name: 'name 1' },
    // { id: 2, name: 'name 2' },
    { id: 3, name: 'name 3' },
    { id: 4, name: 'name 4' },
    { id: 5, name: 'name 5' },
  ])
  const [count, setCount] = useState(0)

  return createElement(
    'div',
    null,
    state
      //   .filter((el, i) => !(count > 0 && i < 2))
      .map((i) =>
        createElement(
          'div',
          {
            key: i.id,
            onClick: () => {
              setState([
                //{ id: 1, name: 'name 1' },
                // { id: 2, name: 'name 2' },
                { id: 5, name: 'name 5' },
                //{ id: 4, name: 'name 4' },
                { id: 3, name: 'name 3' },
              ])
            },
          },
          i.name,
        ),
      ),
  )
}

export const Memo = memo(function memeFunc() {
  console.log('memo update')
  return 'memo'
})
