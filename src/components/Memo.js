import { memo } from '../react/React'

export const Memo = memo(function memeFunc() {
  console.log('memo update')
  return 'memo'
})
