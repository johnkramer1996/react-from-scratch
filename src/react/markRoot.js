export function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime
  }

  var alternate = fiber.alternate

  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime
  }

  var node = fiber.return
  var root = null

  if (node === null && fiber.tag === HostRoot) {
    root = fiber.stateNode
  } else {
    while (node !== null) {
      alternate = node.alternate

      if (node.childExpirationTime < expirationTime) {
        node.childExpirationTime = expirationTime

        if (alternate !== null && alternate.childExpirationTime < expirationTime) {
          alternate.childExpirationTime = expirationTime
        }
      } else if (alternate !== null && alternate.childExpirationTime < expirationTime) {
        alternate.childExpirationTime = expirationTime
      }

      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode
        break
      }

      node = node.return
    }
  }

  if (root !== null) {
    if (workInProgressRoot === root) {
      markUnprocessedUpdateTime(expirationTime)

      // if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
      //   markRootSuspendedAtTime(root, renderExpirationTime$1)
      // }
    }

    markRootUpdatedAtTime(root, expirationTime)
  }

  return root
}

export function markRootUpdatedAtTime(root, expirationTime) {
  var firstPendingTime = root.firstPendingTime

  if (expirationTime > firstPendingTime) {
    root.firstPendingTime = expirationTime
  }

  var firstSuspendedTime = root.firstSuspendedTime

  if (firstSuspendedTime !== NoWork) {
    if (expirationTime >= firstSuspendedTime) {
      root.firstSuspendedTime = root.lastSuspendedTime = root.nextKnownPendingLevel = NoWork
    } else if (expirationTime >= root.lastSuspendedTime) {
      root.lastSuspendedTime = expirationTime + 1
    }

    if (expirationTime > root.nextKnownPendingLevel) {
      root.nextKnownPendingLevel = expirationTime
    }
  }
}

export function markRootFinishedAtTime(root, finishedExpirationTime, remainingExpirationTime) {
  root.firstPendingTime = remainingExpirationTime

  if (finishedExpirationTime <= root.lastSuspendedTime) {
    root.firstSuspendedTime = root.lastSuspendedTime = root.nextKnownPendingLevel = NoWork
  } else if (finishedExpirationTime <= root.firstSuspendedTime) {
    root.firstSuspendedTime = finishedExpirationTime - 1
  }

  if (finishedExpirationTime <= root.lastPingedTime) {
    root.lastPingedTime = NoWork
  }

  if (finishedExpirationTime <= root.lastExpiredTime) {
    root.lastExpiredTime = NoWork
  }
}

export function getNextRootExpirationTimeToWorkOn(root) {
  var lastExpiredTime = root.lastExpiredTime

  if (lastExpiredTime !== NoWork) {
    return lastExpiredTime
  }

  var firstPendingTime = root.firstPendingTime

  if (!isRootSuspendedAtTime(root, firstPendingTime)) {
    return firstPendingTime
  }

  var lastPingedTime = root.lastPingedTime
  var nextKnownPendingLevel = root.nextKnownPendingLevel
  var nextLevel = lastPingedTime > nextKnownPendingLevel ? lastPingedTime : nextKnownPendingLevel

  if (nextLevel <= Idle && firstPendingTime !== nextLevel) {
    return NoWork
  }

  return nextLevel
}

export function isRootSuspendedAtTime(root, expirationTime) {
  var firstSuspendedTime = root.firstSuspendedTime
  var lastSuspendedTime = root.lastSuspendedTime
  return (
    firstSuspendedTime !== NoWork &&
    firstSuspendedTime >= expirationTime &&
    lastSuspendedTime <= expirationTime
  )
}

export function getRemainingExpirationTime(fiber) {
  var updateExpirationTime = fiber.expirationTime
  var childExpirationTime = fiber.childExpirationTime
  return updateExpirationTime > childExpirationTime ? updateExpirationTime : childExpirationTime
}
