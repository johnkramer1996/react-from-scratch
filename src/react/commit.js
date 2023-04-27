import { getRemainingExpirationTime, markRootFinishedAtTime } from './markRoot'
import { ensureRootIsScheduled, flushSyncCallbackQueue } from './scheduleUpdateOnFiber'

export function commitRoot(root) {
  var finishedWork = root.finishedWork
  var expirationTime = root.finishedExpirationTime
  if (finishedWork === null) return null

  root.finishedWork = null
  root.finishedExpirationTime = NoWork
  root.callbackNode = null
  root.callbackExpirationTime = NoWork
  root.callbackPriority = NoPriority
  root.nextKnownPendingLevel = NoWork

  // ! root = workInProgressRoot в prepareFreshStack
  if (root === workInProgressRoot) {
    // We can reset these now that they are finished.
    workInProgressRoot = null
    workInProgress = null
    renderExpirationTime$1 = NoWork
  }

  var remainingExpirationTimeBeforeCommit = getRemainingExpirationTime(finishedWork)
  markRootFinishedAtTime(root, expirationTime, remainingExpirationTimeBeforeCommit)

  var firstEffect

  // ! Получить первый еффект
  // ! firstEffect -> самый последний ребенок
  if (finishedWork.effectTag > PerformedWork) {
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork
      firstEffect = finishedWork.firstEffect
    } else {
      firstEffect = finishedWork
    }
  } else {
    // ! при первом рендере, еффект есть только в app (placement)
    firstEffect = finishedWork.firstEffect
  }

  if (firstEffect !== null) {
    var prevExecutionContext = executionContext
    executionContext |= CommitContext

    //!nextEffect = firstEffect
    // ! requestIdleCallback(flushPassiveEffects)
    //!commitBeforeMutationEffects()
    nextEffect = firstEffect
    // ! commitResetTextContent / commitDetachRef / commitPlacement / commitWork(unmount useLayout) / commitDeletion(unmountHostComponents / detachFiber)
    commitMutationEffects(root, expirationTime)
    root.current = finishedWork
    //! nextEffect = firstEffect
    // ! useLayout + commitAttachRef
    //! commitLayoutEffects(root, expirationTime)

    nextEffect = null
    executionContext = prevExecutionContext
  } else {
    root.current = finishedWork
  }

  if (rootDoesHavePassiveEffects) {
    // ! если есть useEffect() то в конце будет вызван requestIdleCallback(flushPassiveEffects) который задается в commitBeforeMutationEffects
    rootDoesHavePassiveEffects = false
    rootWithPendingPassiveEffects = root
    pendingPassiveEffectsExpirationTime = expirationTime
    pendingPassiveEffectsRenderPriority = ImmediatePriority
  } else {
    // ! Remove nextEffect pointer to assist GC (иначе будут сброшены в flushPassiveEffects)
    nextEffect = firstEffect

    while (nextEffect !== null) {
      var nextNextEffect = nextEffect.nextEffect
      nextEffect.nextEffect = null
      nextEffect = nextNextEffect
    }
  }

  // ! для сброса колбеков которые выставляется для оптимизации
  ensureRootIsScheduled(root)

  flushSyncCallbackQueue()
  return null
}

export function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    //!setCurrentFiber(nextEffect)
    var effectTag = nextEffect.effectTag

    //!if (effectTag & ContentReset) {
    //!  commitResetTextContent(nextEffect)
    //!}
    //!if (effectTag & Ref) {
    //!  var current = nextEffect.alternate
    //!
    //!  if (current !== null) {
    //!    commitDetachRef(current)
    //!  }
    //!}
    var primaryEffectTag = effectTag & (Placement | Update | Deletion)

    switch (primaryEffectTag) {
      case Placement: {
        // ! добавление или в рутКонтейнер или в хостКонтейнер / добавляется App при первом рендере
        commitPlacement(nextEffect)
        nextEffect.effectTag &= ~Placement
        break
      }

      case PlacementAndUpdate: {
        // ! добавление или в рутКонтейнер или в хостКонтейнер / добовляется App при первом рендере
        commitPlacement(nextEffect)
        nextEffect.effectTag &= ~Placement

        var _current = nextEffect.alternate
        // ! вызтать хук unmount useLayout для ФК, для хоста ничего не делает
        commitWork(_current, nextEffect)
        break
      }

      case Update: {
        // ! если ФК то чтобы вызтать хук useLayout
        // ! при первом рендере ФК только обновляется, вставляется только App
        var _current3 = nextEffect.alternate
        commitWork(_current3, nextEffect)
        break
      }

      case Deletion: {
        // ! unmountHostComponents / detachFiber
        commitDeletion(root, nextEffect, renderPriorityLevel)
        break
      }
    }

    //resetCurrentFiber()
    nextEffect = nextEffect.nextEffect
  }
}

export function commitPlacement(finishedWork) {
  var parentFiber = getHostParentFiber(finishedWork) // Note: these two variables *must* always be updated together.

  var parent
  var isContainer
  var parentStateNode = parentFiber.stateNode

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode
      isContainer = false
      break

    case HostRoot:
      parent = parentStateNode.containerInfo
      isContainer = true
      break
  }

  if (parentFiber.effectTag & ContentReset) {
    resetTextContent(parent)
    parentFiber.effectTag &= ~ContentReset
  }

  var before = getHostSibling(finishedWork)
  if (isContainer) {
    // parent.appendChild(finishedWork.stateNode)
    insertOrAppendPlacementNode(finishedWork, before, parent, insertBefore, appendChild)
    // insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent)
    // insertOrAppendPlacementNode(finishedWork, before, parent)
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent, insertBefore, appendChild)
    // parent.appendChild(finishedWork.stateNode)
  }
}

function insertOrAppendPlacementNode(node, before, parent, insert, append) {
  var tag = node.tag
  var isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    var stateNode = isHost ? node.stateNode : node.stateNode.instance

    if (before) {
      insert(parent, stateNode, before)
    } else {
      append(parent, stateNode)
    }
  } else if (tag === HostPortal);
  else {
    var child = node.child
    //! add all childs
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent, insert, append)
      var sibling = child.sibling

      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent, insert, append)
        sibling = sibling.sibling
      }
    }
  }
}

export function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild)
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child)
}

export function getHostParentFiber(fiber) {
  var parent = fiber.return

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }

    parent = parent.return
  }
}

export function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal
}

// TODO
export function getHostSibling(fiber) {
  var node = fiber
  //eslint-disable-next-line
  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null
      }

      node = node.return
    }

    node.sibling.return = node.return
    node = node.sibling

    while (node.tag !== HostComponent && node.tag !== HostText && node.tag !== DehydratedFragment) {
      if (node.effectTag & Placement) {
        continue siblings
      }

      if (node.child === null || node.tag === HostPortal) {
        continue siblings
      } else {
        node.child.return = node
        node = node.child
      }
    }
    if (!(node.effectTag & Placement)) {
      return node.stateNode
    }
  }
}
