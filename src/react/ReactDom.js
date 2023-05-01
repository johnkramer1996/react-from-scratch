import { createFiberRoot } from './fiber'
import { flushSyncCallbackQueue, scheduleUpdateOnFiber } from './scheduleUpdateOnFiber'

/**
 * render
 * unbatchedUpdates
 * updateContainer
 */

const rootContainerInstance = { current: null }

export function render(children, container) {
  var root = createFiberRoot(container)
  rootContainerInstance.current = container
  unbatchedUpdates(() => updateContainer(children, root))
}

export function getRootHostContainer() {
  return rootContainerInstance.current
}

function unbatchedUpdates(fn) {
  var prevExecutionContext = executionContext

  executionContext &= ~BatchedContext
  executionContext |= LegacyUnbatchedContext

  try {
    return fn()
  } finally {
    executionContext = prevExecutionContext

    if (executionContext === NoContext) flushSyncCallbackQueue()
  }
}

function updateContainer(children, fiberRootNode) {
  var fiberNode = fiberRootNode.current
  fiberNode.pendingProps = { children }
  scheduleUpdateOnFiber(fiberNode)
}
