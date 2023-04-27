import { initializeUpdateQueue } from './update'

function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode)
}

export function shouldConstruct(Component) {
  var prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}

export function createFiberRoot(containerInfo, tag, hydrate) {
  var root = new FiberRootNode(containerInfo, tag, hydrate)

  var uninitializedFiber = createHostRootFiber(tag)
  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root

  initializeUpdateQueue(uninitializedFiber)
  return root
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
    workInProgress.pendingProps = pendingProps // We already have an alternate.
    // Reset the effect tag.

    workInProgress.effectTag = NoEffect // The effect list is no longer valid.

    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null

    {
      workInProgress.actualStartTime = -1
    }
  }

  workInProgress.childExpirationTime = current.childExpirationTime
  workInProgress.expirationTime = current.expirationTime
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue

  var currentDependencies = current.dependencies
  workInProgress.dependencies =
    currentDependencies === null
      ? null
      : {
          expirationTime: currentDependencies.expirationTime,
          firstContext: currentDependencies.firstContext,
          responders: currentDependencies.responders,
        } // These will be overridden during the parent's reconciliation

  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref

  {
    workInProgress.selfBaseDuration = current.selfBaseDuration
    workInProgress.treeBaseDuration = current.treeBaseDuration
  }

  return workInProgress
}

export function createHostRootFiber(tag) {
  return createFiber(HostRoot, null, null, ConcurrentMode | BlockingMode | StrictMode)
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

export function createFiberFromTypeAndProps(type, key, pendingProps, mode, expirationTime) {
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
  var fiber = new FiberNode(fiberTag, pendingProps, key, mode)
  fiber.type = type
  fiber.expirationTime = expirationTime
  return fiber
}

export function FiberRootNode(containerInfo, tag, hydrate) {
  this.tag = tag
  this.current = null
  this.containerInfo = containerInfo
  this.pendingChildren = null
  this.pingCache = null
  this.finishedExpirationTime = NoWork
  this.finishedWork = null
  this.timeoutHandle = noTimeout
  this.context = null
  this.pendingContext = null
  this.hydrate = hydrate
  this.callbackNode = null
  this.callbackPriority = NoPriority
  this.firstPendingTime = NoWork
  this.firstSuspendedTime = NoWork
  this.lastSuspendedTime = NoWork
  this.nextKnownPendingLevel = NoWork
  this.lastPingedTime = NoWork
  this.lastExpiredTime = NoWork

  {
    // this.interactionThreadID = tracing.unstable_getThreadID()
    // this.memoizedInteractions = new Set()
    // this.pendingInteractionMap = new Map()
  }
}

export function FiberNode(tag, pendingProps, key, mode) {
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
  this.updateQueue = null // ! memoizedState - ссылка на первый хук
  this.memoizedState = null // ! updateQueue - еффекты
  this.dependencies = null // ! у меня не используется
  this.mode = mode // ! выставляется хостом mode = 7 = NoMode
  // Effects
  this.effectTag = NoEffect // ! биты еффектов
  this.nextEffect = null // ! след. файбер, начинается с конца
  this.firstEffect = null // ! ссылка на начало
  this.lastEffect = null // ! ссылка на конец
  this.expirationTime = NoWork //
  this.childExpirationTime = NoWork
  this.alternate = null
}
