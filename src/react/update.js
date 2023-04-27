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

export function createUpdate(expirationTime, suspenseConfig) {
  var update = {
    expirationTime: expirationTime,
    suspenseConfig: suspenseConfig,
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

  if (updateQueue === null) {
    // Only occurs if the fiber has been unmounted.
    return
  }

  var sharedQueue = updateQueue.shared
  var pending = sharedQueue.pending

  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }

  sharedQueue.pending = update
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
    queue.shared.pending = null // TODO: Pass `current` as argument

    var current = workInProgress.alternate

    if (current !== null) {
      var currentQueue = current.updateQueue

      if (currentQueue !== null) {
        currentQueue.baseQueue = pendingQueue
      }
    }
  } // These values may change as we process the queue.

  if (baseQueue !== null) {
    var first = baseQueue.next // Iterate through the list of updates to compute the result.

    var newState = queue.baseState
    var newExpirationTime = NoWork
    var newBaseState = null
    var newBaseQueueFirst = null
    var newBaseQueueLast = null

    if (first !== null) {
      var update = first

      do {
        var updateExpirationTime = update.expirationTime

        if (updateExpirationTime < renderExpirationTime) {
          // Priority is insufficient. Skip this update. If this is the first
          // skipped update, the previous update/state is the new base
          // update/state.
          var clone = {
            expirationTime: update.expirationTime,
            suspenseConfig: update.suspenseConfig,
            tag: update.tag,
            payload: update.payload,
            callback: update.callback,
            next: null,
          }

          if (newBaseQueueLast === null) {
            newBaseQueueFirst = newBaseQueueLast = clone
            newBaseState = newState
          } else {
            newBaseQueueLast = newBaseQueueLast.next = clone
          } // Update the remaining priority in the queue.

          if (updateExpirationTime > newExpirationTime) {
            newExpirationTime = updateExpirationTime
          }
        } else {
          // This update does have sufficient priority.
          if (newBaseQueueLast !== null) {
            var _clone = {
              expirationTime: Sync,
              // This update is going to be committed so we never want uncommit it.
              suspenseConfig: update.suspenseConfig,
              tag: update.tag,
              payload: update.payload,
              callback: update.callback,
              next: null,
            }
            newBaseQueueLast = newBaseQueueLast.next = _clone
          } // Mark the event time of this update as relevant to this render pass.
          // TODO: This should ideally use the true event time of this update rather than
          // its priority which is a derived and not reverseable value.
          // TODO: We should skip this update if it was already committed but currently
          // we have no way of detecting the difference between a committed and suspended
          // update here.

          markRenderEventTimeAndConfig(updateExpirationTime, update.suspenseConfig) // Process this update.

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
        }

        update = update.next

        if (update === null || update === first) {
          pendingQueue = queue.shared.pending

          if (pendingQueue === null) {
            break
          } else {
            // An update was scheduled from inside a reducer. Add the new
            // pending updates to the end of the list and keep processing.
            update = baseQueue.next = pendingQueue.next
            pendingQueue.next = first
            queue.baseQueue = baseQueue = pendingQueue
            queue.shared.pending = null
          }
        }
      } while (true) // eslint-disable-line
    }

    if (newBaseQueueLast === null) {
      newBaseState = newState
    } else {
      newBaseQueueLast.next = newBaseQueueFirst
    }

    queue.baseState = newBaseState
    queue.baseQueue = newBaseQueueLast // Set the remaining expiration time to be whatever is remaining in the queue.
    // This should be fine because the only two other things that contribute to
    // expiration time are props and context. We're already in the middle of the
    // begin phase by the time we start processing the queue, so we've already
    // dealt with the props. Context in components that specify
    // shouldComponentUpdate is tricky; but we'll have to account for
    // that regardless.

    markUnprocessedUpdateTime(newExpirationTime)
    workInProgress.expirationTime = newExpirationTime
    workInProgress.memoizedState = newState
  }

  {
    currentlyProcessingQueue = null
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

export function markRenderEventTimeAndConfig(expirationTime, suspenseConfig) {
  if (expirationTime < workInProgressRootLatestProcessedExpirationTime && expirationTime > Idle) {
    workInProgressRootLatestProcessedExpirationTime = expirationTime
  }

  if (suspenseConfig !== null) {
    if (expirationTime < workInProgressRootLatestSuspenseTimeout && expirationTime > Idle) {
      workInProgressRootLatestSuspenseTimeout = expirationTime // Most of the time we only have one config and getting wrong is not bad.

      workInProgressRootCanSuspendUsingConfig = suspenseConfig
    }
  }
}
export function markUnprocessedUpdateTime(expirationTime) {
  if (expirationTime > workInProgressRootNextUnprocessedUpdateTime) {
    workInProgressRootNextUnprocessedUpdateTime = expirationTime
  }
}
