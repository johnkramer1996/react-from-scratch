import { scheduleUpdateOnFiber } from './scheduleUpdateOnFiber'

export function renderWithHooks(current, workInProgress, Component, props, secondArg) {
  currentlyRenderingFiber$1 = workInProgress
  workInProgress.memoizedState = null
  workInProgress.updateQueue = null

  ReactCurrentDispatcher.current =
    current !== null && current.memoizedState !== null
      ? HooksDispatcherOnUpdateInDEV
      : HooksDispatcherOnMountInDEV
  var children = Component(props, secondArg)
  currentlyRenderingFiber$1 = null
  currentHook = null
  workInProgressHook = null

  return children
}

const HooksDispatcherOnMountInDEV = {
  useCallback: function (callback, deps) {
    return mountCallback(callback, deps)
  },
  useContext: function (context, observedBits) {
    return readContext(context, observedBits)
  },
  useEffect: function (create, deps) {
    return mountEffect(create, deps)
  },
  useLayoutEffect: function (create, deps) {
    return mountLayoutEffect(create, deps)
  },
  useMemo: function (create, deps) {
    return mountMemo(create, deps)
  },
  useReducer: function (reducer, initialArg, init) {
    return mountReducer(reducer, initialArg, init)
  },
  useRef: function (initialValue) {
    return mountRef(initialValue)
  },
  useState: function (initialState) {
    return mountState(initialState)
  },
}

const HooksDispatcherOnUpdateInDEV = {
  useCallback: function (callback, deps) {
    return updateCallback(callback, deps)
  },
  useContext: function (context, observedBits) {
    return readContext(context, observedBits)
  },
  useEffect: function (create, deps) {
    return updateEffect(create, deps)
  },
  useLayoutEffect: function (create, deps) {
    return updateLayoutEffect(create, deps)
  },
  useMemo: function (create, deps) {
    return updateMemo(create, deps)
  },
  useReducer: function (reducer, initialArg, init) {
    return updateReducer(reducer, initialArg, init)
  },
  useRef: function (initialValue) {
    return updateRef()
  },
  useState: function (initialState) {
    return updateState(initialState)
  },
}

function resolveDispatcher() {
  var dispatcher = ReactCurrentDispatcher.current
  return dispatcher
}

export function mountCallback(callback, deps) {
  var hook = mountWorkInProgressHook()
  var nextDeps = deps === undefined ? null : deps
  hook.memoizedState = [callback, nextDeps]
  return callback
}

export function updateCallback(callback, deps) {
  var hook = updateWorkInProgressHook()
  var nextDeps = deps === undefined ? null : deps
  var prevState = hook.memoizedState

  if (prevState !== null) {
    if (nextDeps !== null) {
      var prevDeps = prevState[1]

      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0]
      }
    }
  }

  hook.memoizedState = [callback, nextDeps]
  return callback
}

export function mountMemo(nextCreate, deps) {
  var hook = mountWorkInProgressHook()
  var nextDeps = deps === undefined ? null : deps
  var nextValue = nextCreate()
  hook.memoizedState = [nextValue, nextDeps]
  return nextValue
}

export function updateMemo(nextCreate, deps) {
  var hook = updateWorkInProgressHook()
  var nextDeps = deps === undefined ? null : deps
  var prevState = hook.memoizedState

  if (prevState !== null) {
    if (nextDeps !== null) {
      var prevDeps = prevState[1]

      if (areHookInputsEqual(nextDeps, prevDeps)) return prevState[0]
    }
  }

  var nextValue = nextCreate()
  hook.memoizedState = [nextValue, nextDeps]
  return nextValue
}

export function mountRef(initialValue) {
  var hook = mountWorkInProgressHook()
  var ref = {
    current: initialValue,
  }
  Object.seal(ref)
  hook.memoizedState = ref
  return ref
}

export function updateRef(initialValue) {
  var hook = updateWorkInProgressHook()
  return hook.memoizedState
}

export function mountLayoutEffect(create, deps) {
  return mountEffectImpl(Update, Layout, create, deps)
}

export function updateLayoutEffect(create, deps) {
  return updateEffectImpl(Update, Layout, create, deps)
}

export function mountEffect(create, deps) {
  return mountEffectImpl(Update | Passive, Passive$1, create, deps)
}

export function updateEffect(create, deps) {
  return updateEffectImpl(Update | Passive, Passive$1, create, deps)
}

function mountEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {
  var hook = mountWorkInProgressHook()
  var nextDeps = deps === undefined ? null : deps
  currentlyRenderingFiber$1.effectTag |= fiberEffectTag
  hook.memoizedState = pushEffect(HasEffect | hookEffectTag, create, undefined, nextDeps)
}

function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps) {
  var hook = updateWorkInProgressHook()
  var nextDeps = deps === undefined ? null : deps
  var destroy = undefined

  if (currentHook !== null) {
    var prevEffect = currentHook.memoizedState
    destroy = prevEffect.destroy

    if (nextDeps !== null) {
      if (areHookInputsEqual(nextDeps, prevEffect.deps)) {
        pushEffect(hookEffectTag, create, destroy, nextDeps)
        return
      }
    }
  }

  currentlyRenderingFiber$1.effectTag |= fiberEffectTag
  hook.memoizedState = pushEffect(HasEffect | hookEffectTag, create, destroy, nextDeps)
}

function mountReducer(reducer, initialArg, init) {
  var hook = mountWorkInProgressHook()
  var initialState = init !== undefined ? init(initialArg) : initialArg
  hook.memoizedState = hook.baseState = initialState
  var queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: initialState,
  })
  var dispatch = (queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue))
  return [hook.memoizedState, dispatch]
}

function updateReducer(reducer, initialArg, init) {
  var hook = updateWorkInProgressHook()
  var queue = hook.queue
  queue.lastRenderedReducer = reducer
  var current = currentHook
  var baseQueue = current.baseQueue
  var pendingQueue = queue.pending

  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      var baseFirst = baseQueue.next
      var pendingFirst = pendingQueue.next
      baseQueue.next = pendingFirst
      pendingQueue.next = baseFirst
    }

    current.baseQueue = baseQueue = pendingQueue
    queue.pending = null
  }

  if (baseQueue !== null) {
    var first = baseQueue.next
    var newState = current.baseState
    var newBaseState = null
    var newBaseQueueFirst = null
    var newBaseQueueLast = null
    var update = first

    do {
      if (newBaseQueueLast !== null) {
        var _clone = {
          action: update.action,
          eagerReducer: update.eagerReducer,
          eagerState: update.eagerState,
          next: null,
        }
        newBaseQueueLast = newBaseQueueLast.next = _clone
      }

      newState =
        update.eagerReducer === reducer ? update.eagerState : reducer(newState, update.action)

      update = update.next
    } while (update !== null && update !== first)

    if (newBaseQueueLast === null) newBaseState = newState
    else newBaseQueueLast.next = newBaseQueueFirst

    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast
    queue.lastRenderedState = newState
  }

  var dispatch = queue.dispatch
  return [hook.memoizedState, dispatch]
}

function mountState(initialState) {
  var hook = mountWorkInProgressHook()
  if (typeof initialState === 'function') initialState = initialState()
  hook.memoizedState = hook.baseState = initialState
  var queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  })
  var dispatch = (queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue))
  return [hook.memoizedState, dispatch]
}

function updateState(initialState) {
  return updateReducer(basicStateReducer)
}

export function useContext(Context, unstable_observedBits) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useContext(Context, unstable_observedBits)
}
export function useState(initialState) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}
export function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer, initialArg, init)
}
export function useRef(initialValue) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useRef(initialValue)
}
export function useEffect(create, deps) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useEffect(create, deps)
}
export function useLayoutEffect(create, deps) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useLayoutEffect(create, deps)
}
export function useCallback(callback, deps) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useCallback(callback, deps)
}
export function useMemo(create, deps) {
  var dispatcher = resolveDispatcher()
  return dispatcher.useMemo(create, deps)
}

function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null, // ! memoizedState useEffect(tag, create, destroy, deps, next}) useRef(ref), useReducer(state) useState(state)
    baseState: null, // !
    baseQueue: null, // ! baseState/baseQueue - для пропусков еффектов которые уже не нужны
    queue: null, // ! queue - очередь экшенов
    next: null, // ! next следующий хук
  }

  if (workInProgressHook === null)
    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook
  else workInProgressHook = workInProgressHook.next = hook

  return workInProgressHook
}

function updateWorkInProgressHook() {
  var nextCurrentHook

  if (currentHook === null) {
    var current = currentlyRenderingFiber$1.alternate
    nextCurrentHook = current !== null ? current.memoizedState : null
  } else {
    nextCurrentHook = currentHook.next
  }

  var nextWorkInProgressHook =
    workInProgressHook === null ? currentlyRenderingFiber$1.memoizedState : workInProgressHook.next

  if (nextWorkInProgressHook !== null) {
    workInProgressHook = nextWorkInProgressHook
    nextWorkInProgressHook = workInProgressHook.next
    currentHook = nextCurrentHook
  } else {
    currentHook = nextCurrentHook
    var newHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null,
    }

    if (workInProgressHook === null)
      currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook
    else workInProgressHook = workInProgressHook.next = newHook
  }

  return workInProgressHook
}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}

function dispatchAction(fiber, queue, action) {
  var update = {
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  }
  update.priority = ImmediatePriority
  var pending = queue.pending

  // ! ставить update в связной список
  if (pending === null) update.next = update
  else {
    update.next = pending.next
    pending.next = update
  }
  queue.pending = update

  //var lastRenderedReducer = queue.lastRenderedReducer
  //if (lastRenderedReducer !== null) {
  //  var currentState = queue.lastRenderedState
  //  var eagerState = lastRenderedReducer(currentState, action)
  //  update.eagerReducer = lastRenderedReducer
  //  update.eagerState = eagerState
  //  if (Object.is(eagerState, currentState)) return
  //}

  scheduleUpdateOnFiber(fiber)
}

function pushEffect(tag, create, destroy, deps) {
  var effect = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  }
  var componentUpdateQueue = currentlyRenderingFiber$1.updateQueue

  if (componentUpdateQueue === null) {
    componentUpdateQueue = { lastEffect: null }
    currentlyRenderingFiber$1.updateQueue = componentUpdateQueue
    componentUpdateQueue.lastEffect = effect.next = effect
  } else {
    var lastEffect = componentUpdateQueue.lastEffect

    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect
    } else {
      var firstEffect = lastEffect.next
      lastEffect.next = effect
      effect.next = firstEffect
      componentUpdateQueue.lastEffect = effect
    }
  }

  return effect
}

function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) continue
    return false
  }
  return true
}
