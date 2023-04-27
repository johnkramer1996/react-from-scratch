import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from './React'
import { createFiberFromElement, createFiberFromText } from './fiber'

export function reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime) {
  // ! у рута всегда есть current -> создается в prepareFreshStack
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    )
  } else {
    // ! current.child нужен чтобы не пересоздовать ноду
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    )
  }
}

var reconcileChildFibers = ChildReconciler(true)
var mountChildFibers = ChildReconciler(false)
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
}

export function ChildReconciler(shouldTrackSideEffects) {
  // ! пометить файбер на удаление и добавить в связной список к родителю
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      return
    }
    var last = returnFiber.lastEffect

    // ! Добавить в связной список
    if (last !== null) {
      last.nextEffect = childToDelete
      returnFiber.lastEffect = childToDelete
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete
    }
    // ! и поменить на удаление
    childToDelete.nextEffect = null
    childToDelete.effectTag = Deletion
  }

  // ! добавить еффект на удаление файбер и соседей
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) return null

    var childToDelete = currentFirstChild
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
  }

  // ! создать карту по ключу или индексу
  function mapRemainingChildren(returnFiber, currentFirstChild) {
    var existingChildren = new Map()
    var existingChild = currentFirstChild

    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild)
      } else {
        existingChildren.set(existingChild.index, existingChild)
      }

      existingChild = existingChild.sibling
    }

    return existingChildren
  }

  // ! вернуть старый файбер с новыми пропсами
  function useFiber(fiber, pendingProps) {
    var clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex

    if (!shouldTrackSideEffects) {
      return lastPlacedIndex
    }

    var current = newFiber.alternate

    if (current !== null) {
      var oldIndex = current.index

      // ! если порядок изменился то пометить на размещение
      if (oldIndex < lastPlacedIndex) {
        newFiber.effectTag = Placement
        // ! нужно перемещать
        // ! 1-2-3 => 1-3-"2"
        return lastPlacedIndex
      } else {
        // ! не нужно перемещать
        // ! 1-2-3 => 1-"3"-2
        return oldIndex
      }
    } else {
      // ! разместить если раньше не было
      newFiber.effectTag = Placement
      return lastPlacedIndex
    }
  }

  // ! отметить на размещение в коммите
  function placeSingleChild(newFiber) {
    // ! для хоста всегда shouldTrackSideEffects = true
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement
    }

    return newFiber
  }

  // ! если тип не поменялся то вернуть старый, иначе создать
  function updateTextNode(returnFiber, current, textContent, expirationTime) {
    if (current === null || current.tag !== HostText) {
      var created = createFiberFromText(textContent, returnFiber.mode, expirationTime)
      created.return = returnFiber
      return created
    } else {
      var existing = useFiber(current, textContent)
      existing.return = returnFiber
      return existing
    }
  }

  // ! если тип не поменялся то вернуть старый, иначе создать
  function updateElement(returnFiber, current, element, expirationTime) {
    if (current !== null) {
      if (current.type === element.type) {
        var existing = useFiber(current, element.props)
        existing.ref = element.ref
        existing.return = returnFiber

        return existing
      }
    }

    var created = createFiberFromElement(element, returnFiber.mode, expirationTime)
    created.ref = element.ref
    created.return = returnFiber
    return created
  }

  // ! если тип не поменялся то вернуть старый, иначе создать
  function updateFragment(returnFiber, current, fragment, expirationTime, key) {
    if (current === null || current.tag !== Fragment) {
      var created = createFiberFromFragment(fragment, returnFiber.mode, expirationTime, key)
      created.return = returnFiber
      return created
    } else {
      var existing = useFiber(current, fragment)
      existing.return = returnFiber
      return existing
    }
  }

  function createChild(returnFiber, newChild, expirationTime) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var created = createFiberFromText(newChild, returnFiber.mode)
      created.return = returnFiber
      return created
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var _created = createFiberFromElement(newChild, returnFiber.mode, expirationTime)
          _created.ref = newChild.ref
          _created.return = returnFiber
          return _created
        }
      }

      if (Array.isArray(newChild)) {
        // ! сюда попадаем через map
        var _created3 = createFiberFromFragment(newChild, returnFiber.mode, expirationTime, null)

        _created3.return = returnFiber
        return _created3
      }
    }
  }

  function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
    var key = oldFiber !== null ? oldFiber.key : null

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      if (key !== null) {
        return null
      }

      return updateTextNode(returnFiber, oldFiber, newChild, expirationTime)
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          // ! если ключ тот же
          // ! если тип не поменялся то вернуть старый, иначе создать
          if (newChild.key === key) {
            if (newChild.type === REACT_FRAGMENT_TYPE) {
              return updateFragment(
                returnFiber,
                oldFiber,
                newChild.props.children,
                expirationTime,
                key,
              )
            }

            return updateElement(returnFiber, oldFiber, newChild, expirationTime)
          } else {
            return null
          }
        }
      }

      if (Array.isArray(newChild)) {
        if (key !== null) {
          return null
        }

        return updateFragment(returnFiber, oldFiber, newChild, expirationTime, null)
      }
    }

    return null
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      var matchedFiber = existingChildren.get(newIdx) || null
      return updateTextNode(returnFiber, matchedFiber, newChild, expirationTime)
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          var _matchedFiber =
            existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null

          if (newChild.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              _matchedFiber,
              newChild.props.children,
              expirationTime,
              newChild.key,
            )
          }

          return updateElement(returnFiber, _matchedFiber, newChild, expirationTime)
        }
      }

      if (isArray$1(newChild)) {
        var _matchedFiber3 = existingChildren.get(newIdx) || null

        return updateFragment(returnFiber, _matchedFiber3, newChild, expirationTime, null)
      }
    }

    return null
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
    var resultingFirstChild = null
    let previousNewFiber = null
    var oldFiber = currentFirstChild
    var lastPlacedIndex = 0
    var newIdx = 0
    var nextOldFiber = null

    // ! пропуск если нет старого файбера
    const isDebug = newChildren.length === 5
    // ! обноавить файбер если порядок и ключ не изменился / если порядок меняется сразу выход
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        // ! если новый файбер нет то вернемся
        nextOldFiber = oldFiber
        oldFiber = null
      } else {
        nextOldFiber = oldFiber.sibling
      }
      // ! placeChild - для пометки на размещение
      // ! updateSlot - если ключ и порядок не поменячлся вернуть старый, иначе null
      // ! updateFromMap - если находит по ключу или по индексу возращает старый файбер
      // ! updateElement - если тип не поменялся вернул старый, иначе создать новый
      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime)

      // ! сразу выходим если нет файбера
      if (newFiber === null) {
        if (oldFiber === null) {
          // ! перейти к следующему
          oldFiber = nextOldFiber
        }

        break
      }

      if (shouldTrackSideEffects) {
        // ! удалить старый если новый был создан
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber)
        }
      }

      // ! помечается что нужно переместить / здесь это нужно для увеличение lastPlacedIndex
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    if (newIdx === newChildren.length) {
      // ! удалить оставшиеся и вернуть первого
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

    // ! при маунте создаем и возращаем первый файбер
    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        // ! создается файбер из текста или из рект комопнента
        var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime)

        if (_newFiber === null) {
          continue
        }

        // ! в этой цикле lastPlacedIndex - можно убрать
        lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx)

        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber
        } else {
          previousNewFiber.sibling = _newFiber
        }

        previousNewFiber = _newFiber
      }

      return resultingFirstChild
    }

    // ! Add all children to a key map for quick lookups.
    // ! создается карта с доступом по ключу(или индекс если нет ключа)
    var existingChildren = mapRemainingChildren(returnFiber, oldFiber) // Keep scanning and use the map to restore deleted items as moves.

    // ! поиск по ключу и по индексу
    // ! если порядок меняется то в placeChild помечаем
    for (; newIdx < newChildren.length; newIdx++) {
      // ! updateFromMap - если находит по ключу или по индексу возращает старый файбер
      var _newFiber2 = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        expirationTime,
      )

      if (_newFiber2 !== null) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            // ! удалить из карты
            existingChildren.delete(_newFiber2.key === null ? newIdx : _newFiber2.key)
          }
        }

        // ! Помечаем файбер если порядок изменился
        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx)

        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber2
        } else {
          previousNewFiber.sibling = _newFiber2
        }

        previousNewFiber = _newFiber2
      }
    }

    if (shouldTrackSideEffects) {
      // ! удалить оставшиеся
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child)
      })
    }

    return resultingFirstChild
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      var existing = useFiber(currentFirstChild, textContent)
      existing.return = returnFiber
      return existing
    }

    var created = createFiberFromText(textContent, returnFiber.mode, expirationTime)
    created.return = returnFiber
    return created
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
    var key = element.key
    var child = currentFirstChild

    // ! при первом рендере детей нет
    if (child !== null) {
      if (child.key === key) {
        switch (child.tag) {
          case Fragment: {
            if (element.type === REACT_FRAGMENT_TYPE) {
              var existing = useFiber(child, element.props.children)
              existing.return = returnFiber

              return existing
            }
            break
          }

          default: {
            if (child.type === element.type) {
              var _existing3 = useFiber(child, element.props)

              _existing3.ref = element.ref
              _existing3.return = returnFiber

              return _existing3
            }

            break
          }
        }
      } else {
        deleteChild(returnFiber, child)
      }
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
      var created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        expirationTime,
        element.key,
      )
      created.return = returnFiber
      return created
    }
    var _created4 = createFiberFromElement(element, returnFiber.mode, expirationTime)
    _created4.ref = element.ref
    _created4.return = returnFiber
    return _created4
  }

  function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
    // ! Одиночный обьект(REACT_ELEMENT_TYPE) -> функция, hostComponent
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          // ! placeSingleChild - помечается на размещение
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime),
          )
      }
    }
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFirstChild, newChild, expirationTime),
      )
    }

    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime)
    }

    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }
  // !!!конец!!!

  return reconcileChildFibers
}
