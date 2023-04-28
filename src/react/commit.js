import { appendChild } from './completeWork'
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
    commitMutationEffects(root)
    root.current = finishedWork
    nextEffect = null
    executionContext = prevExecutionContext
  } else {
    root.current = finishedWork
  }
  nextEffect = firstEffect
  while (nextEffect !== null) {
    var nextNextEffect = nextEffect.nextEffect
    nextEffect.nextEffect = null
    nextEffect = nextNextEffect
  }

  return null
}

function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    var effectTag = nextEffect.effectTag

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
        commitDeletion(root, nextEffect, renderPriorityLevel)
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
