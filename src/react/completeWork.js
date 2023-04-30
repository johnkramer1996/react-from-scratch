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

function createTextInstance(text) {
  var textNode = document.createTextNode(text)
  return textNode
}

function createInstance(type) {
  const domElement = document.createElement(type)
  return domElement
}

function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props)
}

function setInitialProperties(domElement, tag, props) {
  setInitialDOMProperties(tag, domElement, props)
}

function setInitialDOMProperties(tag, domElement, nextProps) {}

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
  markUpdate(workInProgress)
}

function updateHostText$1(current, workInProgress, oldText, newText) {
  if (oldText !== newText) markUpdate(workInProgress)
}
