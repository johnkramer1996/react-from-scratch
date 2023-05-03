import { ThemeContext } from './components/ThemeContext'
import { createElement, memo } from './react/React'
import { Component } from './react/ReactComponent'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from './react/renderWithHooks'

// ! todo prepareToReadContext

export const App = () => {
  const [state, setState] = useState([
    { id: 1, name: 'name 1' },
    { id: 2, name: 'name 2' },
    { id: 3, name: 'name 3' },
    { id: 4, name: 'name 4' },
    { id: 5, name: 'name 5' },
  ])
  const [count, setCount] = useState(0)

  useLayoutEffect(() => {
    console.log('2')
  })

  return createElement(
    'div',
    null,
    createElement('button', { onClick: () => setCount((p) => p + 1) }, 'click'),
    createElement(ClassComponent),
  )

  return createElement(
    'div',
    null,
    state.map((i) =>
      createElement(
        'div',
        {
          key: i.id,
          onClick: () => {
            setState([
              { id: 5, name: 'name 5' },
              { id: 3, name: 'name 3' },
            ])
          },
        },
        i.name,
      ),
    ),
  )
}

class ClassComponent extends Component {
  componentWillMount() {
    console.log('first')
  }

  render() {
    return createElement('div', null, 123)
  }
}
