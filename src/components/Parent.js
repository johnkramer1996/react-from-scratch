import { forwardRef } from '../react/React'
import { useContext, useEffect } from '../react/renderWithHooks'
import { ThemeContext } from './ThemeContext'

export const Parent = forwardRef(({ children, onClick }, ref) => {
  const theme = useContext(ThemeContext)

  console.log({ theme })
  console.log('render Parent')

  useEffect(() => {
    console.log('parent useEffect')

    return () => console.log('unmount parent useEffect')
  }, [onClick])

  return children
})
