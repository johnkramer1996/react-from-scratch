import { forwardRef } from '../react/React'
import { useContext, useEffect } from '../react/renderWithHooks'
import { ThemeContext } from './ThemeContext'

export const Parent = forwardRef(({ children, onClick }, ref) => {
  console.log('provider')

  return children
})
