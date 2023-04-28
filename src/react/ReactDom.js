import { createFiberRoot } from './fiber'
import { scheduleUpdateOnFiber } from './scheduleUpdateOnFiber'

/**
 * render
 * unbatchedUpdates
 * updateContainer
 */

export function render(children, container) {
  var root = createFiberRoot(container)
  unbatchedUpdates(() => updateContainer(children, root))
}

export function unbatchedUpdates(fn) {
  return fn()
}

export function updateContainer(children, fiberRootNode) {
  var fiberNode = fiberRootNode.current
  fiberNode.pendingProps = { children }
  scheduleUpdateOnFiber(fiberNode)
}
