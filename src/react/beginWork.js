import { shallowEqual } from './React'
import { createFiberFromTypeAndProps, createWorkInProgress } from './fiber'
import { reconcileChildren } from './reconcileChildren'
import { renderWithHooks } from './renderWithHooks'

/**
 * beginWork
 * updateHostComponent
 * updateHostText
 * updateHostRoot
 * bailoutOnAlreadyFinishedWork
 * cloneChildFibers
 */
export function beginWork(current, workInProgress) {
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

  var currentChild = current.child // This is always exactly one child

  var prevProps = currentChild.memoizedProps // Default to shallow comparison

  var compare = Component.compare
  compare = compare !== null ? compare : shallowEqual

  if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
  }

  workInProgress.flags |= PerformedWork
  var newChild = createWorkInProgress(currentChild, nextProps)
  newChild.ref = workInProgress.ref
  newChild.return = workInProgress
  workInProgress.child = newChild
  return newChild
}

function updateFragment(current, workInProgress) {
  return reconcileChildren(current, workInProgress, workInProgress.pendingProps)
}

export function updateHostComponent(current, workInProgress) {
  return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children)
}

export function updateHostText(current, workInProgress) {
  return null
}

export function updateHostRoot(current, workInProgress) {
  var nextChildren = workInProgress.pendingProps.children
  return reconcileChildren(current, workInProgress, nextChildren)
}

export function bailoutOnAlreadyFinishedWork(current, workInProgress) {
  return cloneChildFibers(current, workInProgress)
}

export function cloneChildFibers(current, workInProgress) {
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
