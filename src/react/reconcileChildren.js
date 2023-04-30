import { REACT_ELEMENT_TYPE } from './React'
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from './fiber'

/**
 * reconcileChildFibers
 * reconcileChildrenArray
 * reconcileSingleTextNode
 * reconcileSingleElement
 * mapRemainingChildren
 * deleteRemainingChildren
 * updateSlot
 * updateFromMap
 * deleteChild
 * useFiber
 * placeChild
 * placeSingleChild
 * updateTextNode
 * updateElement
 * createChild
 */

var reconcileChildFibers = ChildReconciler(true)
var mountChildFibers = ChildReconciler(false)
export function reconcileChildren(current, workInProgress, nextChildren) {
  var child =
    current === null
      ? mountChildFibers(workInProgress, null, nextChildren)
      : reconcileChildFibers(workInProgress, current.child, nextChildren)
  return (workInProgress.child = child)
}

export function ChildReconciler(shouldTrackSideEffects) {
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          var newFiber = reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          return placeSingleChild(newFiber)
      }
    }
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var newFiber = reconcileSingleTextNode(returnFiber, currentFirstChild, newChild)
      return placeSingleChild(newFiber)
    }

    if (Array.isArray(newChild))
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)

    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    var resultingFirstChild = null
    let previousNewFiber = null
    var oldFiber = currentFirstChild
    var lastPlacedIndex = 0
    var newIdx = 0
    var nextOldFiber = null

    // ! 1 mount
    // ! 2 update
    // ! 3 update from map
    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        var _newFiber = createChild(returnFiber, newChildren[newIdx])
        placeChild(_newFiber, lastPlacedIndex, newIdx)

        if (previousNewFiber === null) resultingFirstChild = _newFiber
        else previousNewFiber.sibling = _newFiber
        previousNewFiber = _newFiber
      }
      return resultingFirstChild
    }

    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        // ! если новый файбер нет то вернемся
        nextOldFiber = oldFiber
        oldFiber = null
      } else {
        nextOldFiber = oldFiber.sibling
      }

      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx])

      if (newFiber === null) {
        oldFiber = oldFiber || nextOldFiber
        break
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) deleteChild(returnFiber, oldFiber)
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
      if (previousNewFiber === null) resultingFirstChild = newFiber
      else previousNewFiber.sibling = newFiber
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

    var existingChildren = mapRemainingChildren(oldFiber)
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx])

      if (_newFiber2 !== null) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            var key = _newFiber2.key === null ? newIdx : _newFiber2.key
            existingChildren.delete(key)
          }
        }
        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) resultingFirstChild = _newFiber2
        else previousNewFiber.sibling = _newFiber2
        previousNewFiber = _newFiber2
      }
    }

    if (shouldTrackSideEffects) existingChildren.forEach((child) => deleteChild(returnFiber, child))
    return resultingFirstChild
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent) {
    if (currentFirstChild === null || currentFirstChild.tag !== HostText) {
      var created = createFiberFromText(textContent, returnFiber.mode)
      created.return = returnFiber
      return created
    }

    var existing = useFiber(currentFirstChild, textContent)
    existing.return = returnFiber
    return existing
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    var key = element.key
    var child = currentFirstChild

    if (child === null) {
      var _created4 = createFiberFromElement(element, returnFiber.mode)
      _created4.ref = element.ref
      _created4.return = returnFiber
      return _created4
    }
    if (child.key === key && child.type === element.type) {
      var _existing3 = useFiber(child, element.props)
      _existing3.ref = element.ref
      _existing3.return = returnFiber
      return _existing3
    }
    deleteChild(returnFiber, child)
  }

  function mapRemainingChildren(currentFirstChild) {
    var existingChildren = new Map()
    var existingChild = currentFirstChild

    while (existingChild !== null) {
      var key = existingChild.key !== null ? existingChild.key : existingChild.index
      existingChildren.set(key, existingChild)
      existingChild = existingChild.sibling
    }
    return existingChildren
  }

  function deleteRemainingChildren(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) return null
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
  }

  function updateSlot(returnFiber, oldFiber, newChild) {
    if (typeof newChild === 'string' || typeof newChild === 'number')
      return updateTextNode(returnFiber, oldFiber, newChild)
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var key = oldFiber !== null ? oldFiber.key : null
          if (newChild.key !== key) return null
          return updateElement(returnFiber, oldFiber, newChild)
        }
      }
    }
    return null
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var matchedFiber = existingChildren.get(newIdx) || null
      return updateTextNode(returnFiber, matchedFiber, newChild)
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var key = newChild.key === null ? newIdx : newChild.key
          var _matchedFiber = existingChildren.get(key) || null
          return updateElement(returnFiber, _matchedFiber, newChild)
        }
      }
    }
    return null
  }

  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) return
    var last = returnFiber.lastEffect

    if (last !== null) {
      last.nextEffect = childToDelete
      returnFiber.lastEffect = childToDelete
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete
    }
    childToDelete.nextEffect = null
    childToDelete.effectTag = Deletion
  }

  function useFiber(fiber, pendingProps) {
    var clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) return lastPlacedIndex
    var current = newFiber.alternate
    if (current === null || current.index < lastPlacedIndex) {
      // !mount || порядок изменился
      // ! 1-"2"-3 => 1-3-"2"
      newFiber.effectTag = Placement
      return lastPlacedIndex
    }
    // ! 1-2-"3" => 1-"3"-2
    return current.index
  }

  function placeSingleChild(newFiber) {
    // ! первый ребенок рута ставиться на размещение
    if (shouldTrackSideEffects && newFiber.alternate === null) newFiber.effectTag = Placement
    return newFiber
  }

  function updateTextNode(returnFiber, current, textContent) {
    if (current === null || current.tag !== HostText) {
      var created = createFiberFromText(textContent, returnFiber.mode)
      created.return = returnFiber
      return created
    }
    var existing = useFiber(current, textContent)
    existing.return = returnFiber
    return existing
  }

  function updateElement(returnFiber, current, element) {
    if (current === null || current.type !== element.type) {
      var created = createFiberFromElement(element, returnFiber.mode)
      created.ref = element.ref
      created.return = returnFiber
      return created
    }

    var existing = useFiber(current, element.props)
    existing.ref = element.ref
    existing.return = returnFiber
    return existing
  }

  function createChild(returnFiber, newChild) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var created = createFiberFromText(newChild, returnFiber.mode)
      created.return = returnFiber
      return created
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var _created = createFiberFromElement(newChild, returnFiber.mode)
          _created.ref = newChild.ref
          _created.return = returnFiber
          return _created
        }
      }
    }
    return null
  }

  return reconcileChildFibers
}
