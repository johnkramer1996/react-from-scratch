import { createFiberRoot } from './fiber'
import { scheduleUpdateOnFiber } from './scheduleUpdateOnFiber'
import { createUpdate, enqueueUpdate } from './update'

export function render(children, container) {
  var root = createFiberRoot(container, ConcurrentRoot, false)

  unbatchedUpdates(() => updateContainer(children, root))
}

export function unbatchedUpdates(fn, a) {
  var prevExecutionContext = executionContext

  executionContext &= ~BatchedContext
  executionContext |= LegacyUnbatchedContext

  try {
    return fn(a)
  } finally {
    executionContext = prevExecutionContext

    // ! вызывается при первом рендере
    //!if (executionContext === NoContext) {
    //!  flushSyncCallbackQueue()
    //!}
  }
}

export function updateContainer(element, container) {
  var current$1 = container.current

  var suspenseConfig = null
  var expirationTime = Sync
  container.context = null

  var update = createUpdate(expirationTime, suspenseConfig)
  update.payload = {
    element: element,
  }

  enqueueUpdate(current$1, update)

  scheduleUpdateOnFiber(current$1, expirationTime)
}
