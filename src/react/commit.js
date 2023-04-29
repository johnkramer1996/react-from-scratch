import { appendChild } from './completeWork'
import { ensureRootIsScheduled, flushSyncCallbackQueue } from './scheduleUpdateOnFiber'
/**
 * commitRoot
 * commitMutationEffects
 * commitPlacement
 * appendPlacementNode
 * getHostParentFiber
 * isHostParent
 */

export function commitRoot(root) {
  var finishedWork = root.finishedWork
  if (finishedWork === null) return null

  root.finishedWork = null
  root.callbackNode = null
  root.nextKnownPendingLevel = NoWork

  if (root === workInProgressRoot) {
    workInProgressRoot = null
    workInProgress = null
  }

  var firstEffect

  if (finishedWork.effectTag > PerformedWork) {
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork
      firstEffect = finishedWork.firstEffect
    } else {
      firstEffect = finishedWork
    }
  } else {
    firstEffect = finishedWork.firstEffect
  }

  if (firstEffect !== null) {
    var prevExecutionContext = executionContext
    executionContext |= CommitContext

    nextEffect = firstEffect
    commitBeforeMutationEffects()
    nextEffect = firstEffect
    commitMutationEffects()
    nextEffect = firstEffect
    commitLayoutEffects()

    root.current = finishedWork
    nextEffect = null
    executionContext = prevExecutionContext
  } else {
    root.current = finishedWork
  }

  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false
    rootWithPendingPassiveEffects = root
  } else {
    // ! Remove nextEffect pointer to assist GC (иначе будут сброшены в flushPassiveEffects)
    nextEffect = firstEffect

    while (nextEffect !== null) {
      var nextNextEffect = nextEffect.nextEffect
      nextEffect.nextEffect = null
      nextEffect = nextNextEffect
    }
  }

  ensureRootIsScheduled(root, true)
  flushSyncCallbackQueue()
  return null
}

function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    var effectTag = nextEffect.effectTag

    if ((effectTag & Passive) !== NoEffect) {
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true
        requestIdleCallback(flushPassiveEffects)
      }
    }

    nextEffect = nextEffect.nextEffect
  }
}

function commitMutationEffects() {
  while (nextEffect !== null) {
    var effectTag = nextEffect.effectTag

    if (effectTag & ContentReset) commitResetTextContent(nextEffect)
    if (effectTag & Ref) {
      var current = nextEffect.alternate

      if (current !== null) commitDetachRef(current)
    }

    var primaryEffectTag = effectTag & (Placement | Update | Deletion)

    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect)
        nextEffect.effectTag &= ~Placement
        break
      }

      case PlacementAndUpdate: {
        commitPlacement(nextEffect)
        nextEffect.effectTag &= ~Placement

        var _current = nextEffect.alternate
        commitWork(_current, nextEffect)
        break
      }

      case Update: {
        var _current3 = nextEffect.alternate
        commitWork(_current3, nextEffect)
        break
      }

      case Deletion: {
        commitDeletion(nextEffect)
        break
      }
    }

    nextEffect = nextEffect.nextEffect
  }
}

function commitPlacement(finishedWork) {
  var parentFiber = getHostParentFiber(finishedWork)

  var parent
  var parentStateNode = parentFiber.stateNode

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode
      break

    case HostRoot:
      parent = parentStateNode.containerInfo
      break
  }

  appendPlacementNode(finishedWork, parent, appendChild)
}

function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case HostComponent: {
      var instance = finishedWork.stateNode

      if (instance != null) {
        var newProps = finishedWork.memoizedProps
        var oldProps = current !== null ? current.memoizedProps : newProps
        var type = finishedWork.type
        var updatePayload = finishedWork.updateQueue
        finishedWork.updateQueue = null

        if (updatePayload !== null) {
          commitUpdate(instance, updatePayload, type, oldProps, newProps)
        }
      }

      return
    }

    case HostText: {
      var textInstance = finishedWork.stateNode
      var newText = finishedWork.memoizedProps
      commitTextUpdate(textInstance, newText)
      return
    }

    case HostRoot:
      return
  }
}

function commitDeletion(current) {
  unmountHostComponents(current)
  detachFiber(current)
}

function unmountHostComponents(current) {
  var node = current
  var currentParentIsValid = false
  var currentParent
  var currentParentIsContainer
  while (true) {
    if (!currentParentIsValid) {
      var parent = node.return
      //eslint-disable-next-line
      findParent: while (true) {
        var parentStateNode = parent.stateNode

        switch (parent.tag) {
          case HostComponent:
            currentParent = parentStateNode
            currentParentIsContainer = false
            break findParent

          case HostRoot:
            currentParent = parentStateNode.containerInfo
            currentParentIsContainer = true
            break findParent
        }

        parent = parent.return
      }

      currentParentIsValid = true
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      removeChild(currentParent, node.stateNode)
    } else {
      if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
    }
    if (node === current) return

    while (node.sibling === null) {
      if (node.return === null || node.return === current) return
      node = node.return
    }

    node = node.sibling
  }
}

function detachFiber(current) {
  var alternate = current.alternate
  current.return = null
  current.child = null
  current.memoizedState = null
  current.updateQueue = null
  current.dependencies = null
  current.alternate = null
  current.firstEffect = null
  current.lastEffect = null
  current.pendingProps = null
  current.memoizedProps = null
  current.stateNode = null
  if (alternate !== null) detachFiber(alternate)
}

function commitLayoutEffects() {
  while (nextEffect !== null) {
    var effectTag = nextEffect.effectTag

    if (effectTag & (Update | Callback)) {
      var current = nextEffect.alternate
      commitLifeCycles(current, nextEffect)
    }

    if (effectTag & Ref) {
      commitAttachRef(nextEffect)
    }

    nextEffect = nextEffect.nextEffect
  }
}

function commitLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
    case Block: {
      commitHookEffectListMount(Layout | HasEffect, finishedWork)
      return
    }

    case HostComponent: {
      var _instance2 = finishedWork.stateNode

      if (current === null && finishedWork.effectTag & Update) {
        var type = finishedWork.type
        var props = finishedWork.memoizedProps
        commitMount(_instance2, type, props)
      }
      return
    }
  }
}

function commitPassiveHookEffects(finishedWork) {
  if ((finishedWork.effectTag & Passive) !== NoEffect) {
    switch (finishedWork.tag) {
      case FunctionComponent: {
        commitHookEffectListUnmount(Passive$1 | HasEffect, finishedWork)
        commitHookEffectListMount(Passive$1 | HasEffect, finishedWork)
        break
      }
    }
  }
}

function commitHookEffectListUnmount(tag, finishedWork) {
  var updateQueue = finishedWork.updateQueue
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next
    var effect = firstEffect

    do {
      if ((effect.tag & tag) === tag) {
        var destroy = effect.destroy
        effect.destroy = undefined
        if (destroy !== undefined) destroy()
      }

      effect = effect.next
    } while (effect !== firstEffect)
  }
}

function commitHookEffectListMount(tag, finishedWork) {
  var updateQueue = finishedWork.updateQueue
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next
    var effect = firstEffect

    do {
      if ((effect.tag & tag) === tag) {
        var create = effect.create
        effect.destroy = create()
      }

      effect = effect.next
    } while (effect !== firstEffect)
  }
}

function commitAttachRef(finishedWork) {
  var ref = finishedWork.ref
  if (ref == null) return
  var instance = finishedWork.stateNode
  var instanceToUse
  switch (finishedWork.tag) {
    case HostComponent:
      instanceToUse = getPublicInstance(instance)
      break
    default:
      instanceToUse = instance
  }
  if (typeof ref === 'function') ref(instanceToUse)
  else ref.current = instanceToUse
}

function commitDetachRef(current) {
  var currentRef = current.ref
  if (currentRef === null) return
  if (typeof currentRef === 'function') currentRef(null)
  else currentRef.current = null
}

function appendPlacementNode(node, parent, append) {
  var tag = node.tag
  var isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    var stateNode = isHost ? node.stateNode : node.stateNode.instance

    append(parent, stateNode)
  } else {
    var child = node.child
    if (child !== null) {
      appendPlacementNode(child, parent, append)
      var sibling = child.sibling

      while (sibling !== null) {
        appendPlacementNode(sibling, parent, append)
        sibling = sibling.sibling
      }
    }
  }
}

function getHostParentFiber(fiber) {
  var parent = fiber.return

  while (parent !== null) {
    if (isHostParent(parent)) return parent
    parent = parent.return
  }
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot
}

function commitTextUpdate(textInstance, newText) {
  textInstance.nodeValue = newText
}

export function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects === null) return false

  var root = rootWithPendingPassiveEffects
  rootWithPendingPassiveEffects = null

  var prevExecutionContext = executionContext
  executionContext |= CommitContext

  var _effect2 = root.current.firstEffect

  while (_effect2 !== null) {
    commitPassiveHookEffects(_effect2)

    var nextNextEffect = _effect2.nextEffect

    _effect2.nextEffect = null
    _effect2 = nextNextEffect
  }

  executionContext = prevExecutionContext
  flushSyncCallbackQueue()
  return true
}

export function getPublicInstance(instance) {
  return instance
}

function setTextContent(node, text) {
  if (text) {
    var firstChild = node.firstChild

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text
      return
    }
  }

  node.textContent = text
}
export function resetTextContent(domElement) {
  setTextContent(domElement, '')
}

export function commitResetTextContent(current) {
  resetTextContent(current.stateNode)
}
