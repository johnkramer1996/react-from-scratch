import { memo } from '../react/React'

export const Memo = memo(() => {
  console.log('memo update')
  return 'memo'
})
