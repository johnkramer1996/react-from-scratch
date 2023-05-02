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
        {
          enterDisallowedContextReadInDEV()

          if (workInProgress.mode & StrictMode) {
            _payload.call(instance, prevState, nextProps)
          }
        }

        partialState = _payload.call(instance, prevState, nextProps)

        {
          exitDisallowedContextReadInDEV()
        }
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

export function processUpdateQueue(workInProgress, props, instance, renderExpirationTime) {
  // This is always non-null on a ClassComponent or HostRoot
  var queue = workInProgress.updateQueue
  hasForceUpdate = false

  {
    currentlyProcessingQueue = queue.shared
  } // The last rebase update that is NOT part of the base state.

  var baseQueue = queue.baseQueue // The last pending update that hasn't been processed yet.
  var pendingQueue = queue.shared.pending

  if (pendingQueue !== null) {
    // We have new updates that haven't been processed yet.
    // We'll add them to the base queue.
    if (baseQueue !== null) {
      // Merge the pending queue and the base queue.
      var baseFirst = baseQueue.next
      var pendingFirst = pendingQueue.next
      baseQueue.next = pendingFirst
      pendingQueue.next = baseFirst
    }

    baseQueue = pendingQueue
    queue.shared.pending = null

    var current = workInProgress.alternate
    if (current !== null) {
      var currentQueue = current.updateQueue

      if (currentQueue !== null) {
        currentQueue.baseQueue = pendingQueue
      }
    }
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
          var effects = queue.effects

          if (effects === null) {
            queue.effects = [update]
          } else {
            effects.push(update)
          }
        }

        update = update.next

        if (update === null || update === first) {
          pendingQueue = queue.shared.pending

          if (pendingQueue === null) {
            break
          } else {
            update = baseQueue.next = pendingQueue.next
            pendingQueue.next = first
            queue.baseQueue = baseQueue = pendingQueue
            queue.shared.pending = null
          }
        }
      } while (true) // eslint-disable-line
    }

    workInProgress.expirationTime = newExpirationTime
    workInProgress.memoizedState = newState
  }

  {
    currentlyProcessingQueue = null
  }
}
