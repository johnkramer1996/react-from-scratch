import { reconcileChildren } from './reconcileChildren'

/**
 * beginWork
 * updateHostComponent
 * updateHostText
 * updateHostRoot
 * bailoutOnAlreadyFinishedWork
 * cloneChildFibers
 */
export function beginWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText(current, workInProgress)
  }
  return null
}

export function updateHostComponent(current, workInProgress) {
  var nextChildren = workInProgress.pendingProps.children
  return reconcileChildren(current, workInProgress, nextChildren)
}

export function updateHostText(current, workInProgress) {
  return null
}

export function updateHostRoot(current, workInProgress) {
  var nextChildren = workInProgress.pendingProps.children
  return reconcileChildren(current, workInProgress, nextChildren)
}

export function bailoutOnAlreadyFinishedWork(current, workInProgress) {
  cloneChildFibers(current, workInProgress)
  return workInProgress.child
}

export function cloneChildFibers(current, workInProgress) {
  if (workInProgress.child === null) return

  var currentChild = workInProgress.child
  var newChild = createWorkInProgress(currentChild, currentChild.pendingProps)
  workInProgress.child = newChild
  newChild.return = workInProgress

  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps)
    newChild.return = workInProgress
  }

  newChild.sibling = null
}
