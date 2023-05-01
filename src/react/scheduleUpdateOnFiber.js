import { beginWork } from './beginWork'
import { commitPassiveHookEffects, commitRoot } from './commit'
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
  if (
    (executionContext & LegacyUnbatchedContext) !== NoContext &&
    (executionContext & (RenderContext | CommitContext)) === NoContext
  ) {
    performSyncWorkOnRoot(root)
  } else {
    ensureRootIsScheduled(root)
    if (executionContext === NoContext) flushSyncCallbackQueue()
  }
}

export function ensureRootIsScheduled(root, reset = false) {
  if (reset) {
    root.callbackNode = null

    return
  }
  if (root.callbackNode !== null) return
  root.callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
}

export function performSyncWorkOnRoot(root) {
  if (root !== workInProgressRoot) prepareFreshStack(root)

  if (workInProgress !== null) {
    var prevExecutionContext = executionContext
    executionContext |= RenderContext
    workLoopSync()
    executionContext = prevExecutionContext
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
  var alternate = fiber.alternate

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

export function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback]
  } else {
    syncQueue.push(callback)
  }
  return fakeCallbackNode
}

export function flushSyncCallbackQueue() {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true

    try {
      var _isSync = true
      var queue = syncQueue
      for (var i = 0; i < queue.length; i++) {
        var callback = queue[i]

        do {
          callback = callback(_isSync)
        } while (callback !== null)
      }
      syncQueue = null
    } finally {
      isFlushingSyncQueue = false
    }
  }
}

export function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects === null) return false

  var root = rootWithPendingPassiveEffects
  rootWithPendingPassiveEffects = null

  var prevExecutionContext = executionContext
  executionContext |= CommitContext

  var _effect2 = root.current.firstEffect

  while (_effect2 !== null) {
    commitPassiveHookEffects(_effect2)

    var nextNextEffect = _effect2.nextEffect

    _effect2.nextEffect = null
    _effect2 = nextNextEffect
  }

  executionContext = prevExecutionContext
  flushSyncCallbackQueue()
  return true
}
