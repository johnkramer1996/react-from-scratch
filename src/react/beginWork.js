import { reconcileChildren } from './reconcileChildren'
import { cloneUpdateQueue, processUpdateQueue } from './update'

export function beginWork(current, workInProgress, renderExpirationTime) {
  // ! При первом рендере пропуск

  if (current !== null) {
    var oldProps = current.memoizedProps
    var newProps = workInProgress.pendingProps

    if (oldProps !== newProps || workInProgress.type !== current.type);
    else if (workInProgress.expirationTime < renderExpirationTime) {
      // ! ЕСЛИ ВРЕМЯ НЕ ИЗМЕНИЛОСЬ, ТО НЕТ ИЗМЕНЕНИЙ у текущего файбера
      // ! нужно перейти к детям или вернуть null если нет изменений
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
    }
  }

  // ! ЕСЛИ ЕСТЬ ИЗМЕНЕНИЯ ТО ОБНОВИТЬ
  workInProgress.expirationTime = NoWork
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime)
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime)
    case HostText:
      return updateHostText(current, workInProgress, renderExpirationTime)
  }
  return null
}

export function updateHostComponent(current, workInProgress, renderExpirationTime) {
  var type = workInProgress.type
  var nextProps = workInProgress.pendingProps
  var prevProps = current !== null ? current.memoizedProps : null
  var nextChildren = nextProps.children
  var isDirectTextChild = shouldSetTextContent(type, nextProps)

  if (isDirectTextChild) {
    nextChildren = null
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    workInProgress.effectTag |= ContentReset
  }

  // ! пометить при маунте и если ref изменился
  //!markRef(current, workInProgress)

  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  return workInProgress.child
}

export function updateHostText(current, workInProgress) {
  return null
}

// ! ONLY FIRST RENDER
export function updateHostRoot(current, workInProgress, renderExpirationTime) {
  var nextProps = workInProgress.pendingProps
  var prevState = workInProgress.memoizedState
  var prevChildren = prevState !== null ? prevState.element : null
  cloneUpdateQueue(current, workInProgress)
  processUpdateQueue(workInProgress, nextProps, null, renderExpirationTime)

  var nextState = workInProgress.memoizedState

  // ! Получает App который создается при первом рендере и не меняется
  var nextChildren = nextState.element
  if (nextChildren === prevChildren) return null
  bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime)
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

export function bailoutOnAlreadyFinishedWork(current, workInProgress, renderExpirationTime) {
  // ! ЕСЛИ У ДЕТЕЙ НЕТ ИЗМЕНЕНИЙ -> ЗАВЕРШИТЬ РАБОТУ -> completeUnitOfWork -> completeWork
  if (workInProgress.childExpirationTime < renderExpirationTime) return null
  // ! иначе скопировать детей и продолжит идти в глубину, пропустив этот файбер
  cloneChildFibers(current, workInProgress)
  return workInProgress.child
}

export function shouldSetTextContent(type, props) {
  return (
    type === 'textarea' ||
    type === 'option' ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  )
}
