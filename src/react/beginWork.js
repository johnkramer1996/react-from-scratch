import { shallowEqual } from './React'
import {
  createFiberFromTypeAndProps,
  createWorkInProgress,
  isSimpleFunctionComponent,
} from './fiber'
import { reconcileChildren } from './reconcileChildren'
import { readContext, renderWithHooks } from './renderWithHooks'

/**
 * beginWork
 * updateHostComponent
 * updateHostText
 * updateHostRoot
 * bailoutOnAlreadyFinishedWork
 * cloneChildFibers
 */
export function beginWork(current, workInProgress) {
  if (false && current !== null) {
    var oldProps = current.memoizedProps
    var newProps = workInProgress.pendingProps

    if (oldProps !== newProps || workInProgress.type !== current.type);
    else if (workInProgress.expirationTime < renderExpirationTime) {
      // ! ЕСЛИ ВРЕМЯ НЕ ИЗМЕНИЛОСЬ, ТО НЕТ ИЗМЕНЕНИЙ у текущего файбера
      // ! нужно перейти к детям или вернуть null если нет изменений
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
    }
  }

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type)
    }
    case FunctionComponent: {
      return updateFunctionComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
      )
    }
    case ForwardRef: {
      return updateForwardRef(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
      )
    }
    case MemoComponent: {
      var _type2 = workInProgress.type
      var _unresolvedProps3 = workInProgress.pendingProps // Resolve outer props first, then resolve inner props.

      return updateMemoComponent(current, workInProgress, _type2, _unresolvedProps3)
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText(current, workInProgress)
    case Fragment:
      return updateFragment(current, workInProgress)
    case ContextProvider:
      return updateContextProvider(current, workInProgress)
    case ContextConsumer:
      return updateContextConsumer(current, workInProgress)
  }
  return null
}

function mountIndeterminateComponent(current, workInProgress, Component) {
  workInProgress.tag = FunctionComponent
  return updateFunctionComponent(current, workInProgress, Component, workInProgress.pendingProps)
}

function updateFunctionComponent(current, workInProgress, Component, nextProps) {
  const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, null)

  workInProgress.effectTag |= PerformedWork
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

function updateForwardRef(current, workInProgress, Component, nextProps) {
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component.render,
    nextProps,
    workInProgress.ref,
  )

  workInProgress.effectTag |= PerformedWork
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateMemoComponent(current, workInProgress, Component, nextProps) {
  if (current === null) {
    var type = Component.type

    if (
      isSimpleFunctionComponent(type) &&
      Component.compare === null &&
      Component.defaultProps === undefined
    ) {
      workInProgress.tag = SimpleMemoComponent
      workInProgress.type = type

      return updateSimpleMemoComponent(current, workInProgress, type, nextProps)
    }
    var child = createFiberFromTypeAndProps(
      Component.type,
      null,
      nextProps,
      workInProgress,
      workInProgress.mode,
    )
    child.ref = workInProgress.ref
    child.return = workInProgress
    workInProgress.child = child
    return child
  }

  var currentChild = current.child
  var prevProps = currentChild.memoizedProps
  var compare = Component.compare
  compare = compare !== null ? compare : shallowEqual

  if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress)
  }

  workInProgress.flags |= PerformedWork
  var newChild = createWorkInProgress(currentChild, nextProps)
  newChild.ref = workInProgress.ref
  newChild.return = workInProgress
  workInProgress.child = newChild
  return newChild
}

function updateSimpleMemoComponent(current, workInProgress, Component, nextProps) {
  if (current !== null) {
    var prevProps = current.memoizedProps

    if (
      shallowEqual(prevProps, nextProps) &&
      current.ref === workInProgress.ref &&
      workInProgress.type === current.type
    ) {
      if (updateExpirationTime < renderExpirationTime) {
        workInProgress.expirationTime = current.expirationTime
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
      }
    }
  }

  return updateFunctionComponent(current, workInProgress, Component, nextProps)
}

function updateFragment(current, workInProgress) {
  return reconcileChildren(current, workInProgress, workInProgress.pendingProps)
}

function updateContextProvider(current, workInProgress) {
  var providerType = workInProgress.type
  var context = providerType._context
  var newProps = workInProgress.pendingProps
  var oldProps = workInProgress.memoizedProps
  var newValue = newProps.value

  context._currentValue = newValue

  var newChildren = newProps.children
  reconcileChildren(current, workInProgress, newChildren)
  return workInProgress.child
}

function updateContextConsumer(current, workInProgress) {
  var context = workInProgress.type
  var newProps = workInProgress.pendingProps
  var render = newProps.children

  var newValue = readContext(context)
  var newChildren = render(newValue)

  workInProgress.flags |= PerformedWork
  reconcileChildren(current, workInProgress, newChildren)
  return workInProgress.child
}

function updateHostComponent(current, workInProgress) {
  return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children)
}

function updateHostText(current, workInProgress) {
  return null
}

function updateHostRoot(current, workInProgress) {
  var nextChildren = workInProgress.pendingProps.children
  return reconcileChildren(current, workInProgress, nextChildren)
}

function bailoutOnAlreadyFinishedWork(current, workInProgress) {
  return cloneChildFibers(current, workInProgress)
}

function cloneChildFibers(current, workInProgress) {
  if (workInProgress.child === null) return

  var currentChild = workInProgress.child
  var newChild = createWorkInProgress(currentChild, currentChild.pendingProps)
  workInProgress.child = newChild
  newChild.return = workInProgress

  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps)
    newChild.return = workInProgress
  }

  newChild.sibling = null

  return workInProgress.child
}
