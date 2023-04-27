import { reconcileChildren } from './reconcileChildren'
import { cloneUpdateQueue, processUpdateQueue } from './update'

export function beginWork(current, workInProgress, renderExpirationTime) {
  if (current !== null) {
    var oldProps = current.memoizedProps
    var newProps = workInProgress.pendingProps

    if (oldProps !== newProps || workInProgress.type !== current.type);
    else if (workInProgress.expirationTime < renderExpirationTime) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
    }
  }
  workInProgress.expirationTime = NoWork
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime)
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime)
    case HostText:
      return updateHostText(current, workInProgress, renderExpirationTime)
  }
  return null
}

export function updateHostComponent(current, workInProgress, renderExpirationTime) {
  var nextProps = workInProgress.pendingProps
  var nextChildren = nextProps.children
  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  return workInProgress.child
}

export function updateHostText(current, workInProgress) {
  return null
}

export function updateHostRoot(current, workInProgress, renderExpirationTime) {
  var nextProps = workInProgress.pendingProps
  var prevState = workInProgress.memoizedState
  cloneUpdateQueue(current, workInProgress)
  processUpdateQueue(workInProgress, nextProps, null, renderExpirationTime)

  var nextState = workInProgress.memoizedState

  var nextChildren = nextState.element
  bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

export function bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime) {
  if (workInProgress.childExpirationTime < renderExpirationTime) return null
  cloneChildFibers(current, workInProgress)
  return workInProgress.child
}
