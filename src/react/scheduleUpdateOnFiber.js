import { beginWork } from './beginWork'
import { commitRoot } from './commit'
import { completeUnitOfWork } from './completeWork'
import { createWorkInProgress } from './fiber'

/**
 * scheduleUpdateOnFiber
 * performSyncWorkOnRoot
 * prepareFreshStack
 * workLoopSync
 * performUnitOfWork
 * finishSyncRender
 * getRoot
 */

export function scheduleUpdateOnFiber(fiber) {
  var root = getRoot(fiber)
  performSyncWorkOnRoot(root)
}

export function performSyncWorkOnRoot(root) {
  if (root !== workInProgressRoot) prepareFreshStack(root)
  if (workInProgress !== null) {
    workLoopSync()
    root.finishedWork = root.current.alternate
    finishSyncRender(root)
  }
  return null
}

export function prepareFreshStack(root) {
  root.finishedWork = null
  workInProgressRoot = root
  workInProgress = createWorkInProgress(root.current, root.current.pendingProps)
}

export function workLoopSync() {
  while (workInProgress !== null) workInProgress = performUnitOfWork(workInProgress)
}

export function performUnitOfWork(fiber) {
  var current = fiber.alternate
  var next = beginWork(current, fiber)
  fiber.memoizedProps = fiber.pendingProps
  if (next === null) next = completeUnitOfWork(fiber)
  return next
}

export function finishSyncRender(root) {
  workInProgressRoot = null
  commitRoot(root)
}

export function getRoot(fiber) {
  var node = fiber.return
  var root = null

  if (node === null && fiber.tag === HostRoot) root = fiber.stateNode
  else {
    while (node !== null) {
      alternate = node.alternate
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode
        break
      }
      node = node.return
    }
  }

  return root
}
