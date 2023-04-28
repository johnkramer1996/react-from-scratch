export function renderWithHooks(current, workInProgress, Component, props, secondArg) {
  currentlyRenderingFiber$1 = workInProgress
  workInProgress.memoizedState = null
  workInProgress.updateQueue = null
  workInProgress.expirationTime = NoWork

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

const HooksDispatcherOnMountInDEV = {}

const HooksDispatcherOnUpdateInDEV = {}
