export function initializeUpdateQueue(fiber) {
  var queue = {
    baseState: fiber.memoizedState,
    baseQueue: null,
    shared: {
      pending: null,
    },
    effects: null,
  }
  fiber.updateQueue = queue
}

export function cloneUpdateQueue(current, workInProgress) {
  var queue = workInProgress.updateQueue
  var currentQueue = current.updateQueue

  if (queue === currentQueue) {
    var clone = {
      baseState: currentQueue.baseState,
      baseQueue: currentQueue.baseQueue,
      shared: currentQueue.shared,
      effects: currentQueue.effects,
    }
    workInProgress.updateQueue = clone
  }
}

export function createUpdate(expirationTime) {
  var update = {
    expirationTime: expirationTime,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  }
  update.next = update
  update.priority = ImmediatePriority

  return update
}

export function enqueueUpdate(fiber, update) {
  var updateQueue = fiber.updateQueue
  if (updateQueue === null) return

  var sharedQueue = updateQueue.shared
  var pending = sharedQueue.pending

  if (pending === null) update.next = update
  else {
    update.next = pending.next
    pending.next = update
  }

  sharedQueue.pending = update
}

export function processUpdateQueue(workInProgress, props, instance, renderExpirationTime) {
  var queue = workInProgress.updateQueue
  var baseQueue = queue.baseQueue
  var pendingQueue = queue.shared.pending

  if (pendingQueue !== null) {
    baseQueue = pendingQueue
    queue.shared.pending = null
  }

  if (baseQueue !== null) {
    var first = baseQueue.next // Iterate through the list of updates to compute the result.

    var newState = queue.baseState
    var newExpirationTime = NoWork

    if (first !== null) {
      var update = first

      do {
        newState = getStateFromUpdate(workInProgress, queue, update, newState, props, instance)
        var callback = update.callback

        if (callback !== null) {
          workInProgress.effectTag |= Callback
          ;(queue.effects = effects || []).push(update)
        }

        update = update.next

        if (update === null || update === first) {
          pendingQueue = queue.shared.pending
          if (pendingQueue === null) break

          update = baseQueue.next = pendingQueue.next
          pendingQueue.next = first
          queue.baseQueue = baseQueue = pendingQueue
          queue.shared.pending = null
        }
      } while (true)
    }

    queue.baseState = newState
    queue.baseQueue = null

    workInProgress.expirationTime = newExpirationTime
    workInProgress.memoizedState = newState
  }
}

export function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance) {
  switch (update.tag) {
    case ReplaceState: {
      var payload = update.payload

      if (typeof payload === 'function') {
        // Updater export function
        {
          enterDisallowedContextReadInDEV()

          if (workInProgress.mode & StrictMode) {
            payload.call(instance, prevState, nextProps)
          }
        }

        var nextState = payload.call(instance, prevState, nextProps)

        {
          exitDisallowedContextReadInDEV()
        }

        return nextState
      } // State object

      return payload
    }

    case CaptureUpdate: {
      workInProgress.effectTag = (workInProgress.effectTag & ~ShouldCapture) | DidCapture
    }
    // Intentional fallthrough

    case UpdateState: {
      var _payload = update.payload
      var partialState

      if (typeof _payload === 'function') {
        // Updater export function

        partialState = _payload.call(instance, prevState, nextProps)
      } else {
        // Partial state object
        partialState = _payload
      }

      if (partialState === null || partialState === undefined) {
        // Null and undefined are treated as no-ops.
        return prevState
      } // Merge the partial state and the previous state.

      return Object.assign({}, prevState, partialState)
    }

    case ForceUpdate: {
      hasForceUpdate = true
      return prevState
    }
  }

  return prevState
}
