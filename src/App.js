import { Parent } from './components/Parent'
import { ThemeContext } from './components/ThemeContext'
import { createElement, memo } from './react/React'
import { useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

export const App = () => {
  const [state, setState] = useState([
    { id: 1, name: 'name 1' },
    { id: 2, name: 'name 2' },
    { id: 3, name: 'name 3' },
    { id: 4, name: 'name 4' },
    { id: 5, name: 'name 5' },
  ])
  const [count, setCount] = useState(0)
  const [stateMemo, setmemo] = useState(0)
  const prevValue = useRef(count)

  return createElement(
    'div',
    null,
    state.map((i) =>
      createElement(
        'div',
        {
          key: i.id,
          onClick: () => {
            setCount((p) => p + 1)
            prevValue.current = count
          },
        },
        i.name,
      ),
    ),
    createElement('button', { onClick: () => setCount((p) => p + 1) }, count),
    createElement('button', { onClick: () => setmemo((p) => p + 1) }, stateMemo),
    createElement(Memo, null, stateMemo),
  )
}

export const Memo = memo(function memeFunc() {
  console.log('memo update')
  return 'memo'
})
