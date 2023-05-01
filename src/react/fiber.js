/**
 * createFiberRoot
 * createHostRootFiber
 * createWorkInProgress
 * createFiberFromText
 * createFiberFromElement
 * createFiberFromTypeAndProps
 * createFiber
 * FiberRootNode
 * FiberNode
 */

import {
  REACT_CONTEXT_TYPE,
  REACT_FORWARD_REF_TYPE,
  REACT_FRAGMENT_TYPE,
  REACT_MEMO_TYPE,
  REACT_PROVIDER_TYPE,
} from './React'

export function createFiberRoot(containerInfo) {
  var root = new FiberRootNode(containerInfo)
  var fiberNode = (root.current = createHostRootFiber())
  fiberNode.stateNode = root
  return root
}

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null, ConcurrentMode | BlockingMode | StrictMode)
}

export function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode)
    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.effectTag = NoEffect
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }

  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue

  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref

  return workInProgress
}

export function createFiberFromText(content, mode) {
  return new FiberNode(HostText, content, null, mode)
}

export function createFiberFromElement(element, mode) {
  var type = element.type
  var key = element.key
  var pendingProps = element.props

  return createFiberFromTypeAndProps(type, key, pendingProps, mode)
}

export function createFiberFromTypeAndProps(type, key, props, mode) {
  var fiberTag = IndeterminateComponent

  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent
    } else;
  } else if (typeof type === 'string') {
    fiberTag = HostComponent
  } else {
    getTag: switch (type) {
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, mode, expirationTime, key)
      default: {
        if (typeof type === 'object' && type !== null) {
          switch (type.$$typeof) {
            case REACT_PROVIDER_TYPE:
              fiberTag = ContextProvider
              break getTag

            case REACT_CONTEXT_TYPE:
              // This is a consumer
              fiberTag = ContextConsumer
              break getTag

            case REACT_FORWARD_REF_TYPE:
              fiberTag = ForwardRef
              break getTag

            case REACT_MEMO_TYPE:
              fiberTag = MemoComponent
              break getTag
          }
        }
      }
    }
  }

  var fiber = new FiberNode(fiberTag, props, key, mode)
  fiber.type = type
  return fiber
}

export function detachFiber(current) {
  var alternate = current.alternate
  current.return = null
  current.child = null
  current.memoizedState = null
  current.updateQueue = null
  current.alternate = null
  current.firstEffect = null
  current.lastEffect = null
  current.pendingProps = null
  current.memoizedProps = null
  current.stateNode = null
  if (alternate !== null) detachFiber(alternate)
}

function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode)
}

function FiberRootNode(containerInfo) {
  this.current = null
  this.containerInfo = containerInfo
  this.finishedWork = null
  this.callbackNode = null
}

function FiberNode(tag, pendingProps, key, mode) {
  // Instance
  this.tag = tag // ! FunctionComponent=0/ClassComponent=1/IndeterminateComponent=2/HostRoot=3/HostComponent=6/HostText=6/Fragment=7/ForwardRef=11
  this.key = key // ! unique key
  this.elementType = null // ! for default props FuncC and ClasC
  this.type = null // ! div, button, func
  this.stateNode = null // ! node

  this.return = null // ! родитель
  this.child = null // ! первый ребенок
  this.sibling = null // ! сосед
  this.index = 0 // ! для сравнения
  this.ref = null //  ! ссылка на дом
  this.pendingProps = pendingProps // ! пропсы
  this.memoizedProps = null // ! пропсы записываються после обновления в beginWork
  this.updateQueue = null // ! updateQueue - еффекты
  this.memoizedState = null // !memoizedState - ссылка на первый хук
  this.mode = mode // ! выставляется хостом mode = 7 = NoMode
  // Effects
  this.effectTag = NoEffect // ! биты еффектов
  this.nextEffect = null // ! след. файбер, начинается с конца
  this.firstEffect = null // ! ссылка на начало
  this.lastEffect = null // ! ссылка на конец
  this.alternate = null
}

function shouldConstruct(Component) {
  var prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}
