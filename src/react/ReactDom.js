import { createFiberRoot } from './fiber'
import { flushSyncCallbackQueue, scheduleWork } from './scheduleWork'
import { createUpdate, enqueueUpdate } from './update'

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
  var expirationTime = Sync
  fiberNode.context = null

  var update = createUpdate(expirationTime)
  update.payload = {
    element: children,
  }

  enqueueUpdate(fiberNode, update)
  scheduleWork(fiberNode, expirationTime)
}
