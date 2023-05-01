/**
 * completeUnitOfWork
 * completeWork
 * markUpdate
 * markRef$1
 * createTextInstance
 * createInstance
 * finalizeInitialChildren
 * setInitialProperties
 * setInitialDOMProperties
 * appendChild
 * appendAllChildren
 * updateHostComponent$1
 * updateHostText$1
 */

import { setTextContent, setValueForStyles } from './commit'

export function completeUnitOfWork(workInProgress) {
  do {
    var current = workInProgress.alternate
    var returnFiber = workInProgress.return

    var next = completeWork(current, workInProgress)
    if (next !== null) return next

    if (returnFiber !== null) {
      // !добавить еффекты файбера в очередь
      if (returnFiber.firstEffect === null) returnFiber.firstEffect = workInProgress.firstEffect
      if (workInProgress.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
        }
        returnFiber.lastEffect = workInProgress.lastEffect
      }

      // !добавить текущий файбер в очередь
      if (workInProgress.effectTag > PerformedWork) {
        if (returnFiber.lastEffect !== null) returnFiber.lastEffect.nextEffect = workInProgress
        // ! если нет последнего то и первого
        // ! последний добавиляеться по умолчанию
        else returnFiber.firstEffect = workInProgress
        returnFiber.lastEffect = workInProgress
      }
    }
    var siblingFiber = workInProgress.sibling
    if (siblingFiber !== null) return siblingFiber
    workInProgress = returnFiber
  } while (workInProgress !== null) // We've reached the root.

  return null
}

function completeWork(current, workInProgress) {
  var newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case HostComponent: {
      var type = workInProgress.type

      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent$1(current, workInProgress, type, newProps)
        if (current.ref !== workInProgress.ref) markRef$1(workInProgress)
      } else {
        if (!newProps) return null
        var instance = createInstance(type)
        appendAllChildren(instance, workInProgress)
        workInProgress.stateNode = instance
        finalizeInitialChildren(instance, type, newProps)
      }
      if (workInProgress.ref !== null) markRef$1(workInProgress)
      return null
    }

    case HostText: {
      var newText = newProps

      if (current !== null && workInProgress.stateNode != null)
        updateHostText$1(current, workInProgress, current.memoizedProps, newText)
      else workInProgress.stateNode = createTextInstance(newText)
      return null
    }
  }

  return null
}

function markUpdate(workInProgress) {
  workInProgress.effectTag |= Update
}

function markRef$1(workInProgress) {
  workInProgress.effectTag |= Ref
}

export function createTextInstance(text, internalInstanceHandle) {
  var textNode = document.createTextNode(text)
  precacheFiberNode(internalInstanceHandle, textNode)
  return textNode
}

export function createInstance(type, props, internalInstanceHandle) {
  const domElement = document.createElement(type)
  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}

function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props)
}

function setInitialProperties(domElement, tag, props) {
  setInitialDOMProperties(tag, domElement, props)
}

function setInitialDOMProperties(tag, domElement, nextProps) {
  for (var propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) continue

    var nextProp = nextProps[propKey]

    if (propKey === STYLE) {
      if (nextProp) Object.freeze(nextProp)
      setValueForStyles(domElement, nextProp)
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        var canSetTextContent = tag !== 'textarea' || nextProp !== ''
        if (canSetTextContent) setTextContent(domElement, nextProp)
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp)
      }
    }
  }
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child)
}

function appendAllChildren(parent, workInProgress) {
  var node = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendChild(parent, node.stateNode)
    } else if (node.child !== null) {
      node = node.child
      continue
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) return
      node = node.return
    }
    node = node.sibling
  }
}

function updateHostComponent$1(current, workInProgress, type, newProps) {
  var oldProps = current.memoizedProps
  if (oldProps === newProps) return

  var instance = workInProgress.stateNode
  var updatePayload = prepareUpdate(instance, type, oldProps, newProps)

  workInProgress.updateQueue = updatePayload

  if (updatePayload) markUpdate(workInProgress)
}

function updateHostText$1(current, workInProgress, oldText, newText) {
  if (oldText !== newText) markUpdate(workInProgress)
}

function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps)
}

function diffProperties(domElement, tag, lastRawProps, nextRawProps) {
  var updatePayload = null
  var lastProps
  var nextProps
  lastProps = lastRawProps
  nextProps = nextRawProps

  var propKey
  var styleName
  var styleUpdates = null

  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue
    }

    if (propKey === STYLE) {
      var lastStyle = lastProps[propKey]

      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) styleUpdates = {}

          styleUpdates[styleName] = ''
        }
      }
    }
  }
  for (propKey in nextProps) {
    var nextProp = nextProps[propKey]
    var lastProp = lastProps != null ? lastProps[propKey] : undefined

    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    )
      continue

    if (propKey === STYLE) {
      if (nextProp) Object.freeze(nextProp)

      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) styleUpdates = {}

            styleUpdates[styleName] = ''
          }
        }

        for (styleName in nextProp) {
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) styleUpdates = {}

            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) updatePayload = []

          updatePayload.push(propKey, styleUpdates)
        }

        styleUpdates = nextProp
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        ;(updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    }
  }

  if (styleUpdates) {
    ;(updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }
  return updatePayload
}

var randomKey = Math.random().toString(36).slice(2)
var internalInstanceKey = '__reactInternalInstance$' + randomKey
var internalEventHandlersKey = '__reactEventHandlers$' + randomKey
var internalContainerInstanceKey = '__reactContainere$' + randomKey
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst
}
export function updateFiberProps(node, props) {
  node[internalEventHandlersKey] = props
}
