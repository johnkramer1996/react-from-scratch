import { memo } from '../react/React'

export const Memo = memo(function memeFunc() {
  debugger
  console.log('memo update')
  return 'memo'
})
