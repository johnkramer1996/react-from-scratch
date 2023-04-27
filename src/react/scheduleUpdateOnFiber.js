import { beginWork } from './beginWork'
import { commitRoot } from './commit'
import { completeUnitOfWork } from './completeWork'
import { createWorkInProgress } from './fiber'
import { getNextRootExpirationTimeToWorkOn, markUpdateTimeFromFiberToRoot } from './markRoot'

//! updateContainer / dispatchAction
// ! sync/async call func
export function scheduleUpdateOnFiber(fiber, expirationTime) {
  // ! помечаеться на обновление чтобы потом можно было понять что обновлять
  var root = markUpdateTimeFromFiberToRoot(fiber, expirationTime)
  var priorityLevel = NormalPriority

  // ! через хуки всегда синхронно
  if (expirationTime === Sync) {
    // ! только при первом рендере, синхронная обработка
    if (
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      // schedulePendingInteractions(root, expirationTime);
      performSyncWorkOnRoot(root)
    } else {
      // ! при вызове через юзЕффект асинхронная обработка
      ensureRootIsScheduled(root)
      if (executionContext === NoContext) {
        flushSyncCallbackQueue()
      }
    }
  } else {
    ensureRootIsScheduled(root)
    // schedulePendingInteractions(root, expirationTime)
  }
}

export function ensureRootIsScheduled(root) {
  var lastExpiredTime = root.lastExpiredTime

  // ! в этой версии сюда некогда не зайдет
  if (lastExpiredTime !== NoWork) {
    root.callbackExpirationTime = Sync
    root.callbackPriority = ImmediatePriority
    root.callbackNode = requestIdleCallback(performSyncWorkOnRoot.bind(null, root))
    return
  }

  var expirationTime = getNextRootExpirationTimeToWorkOn(root)
  var existingCallbackNode = root.callbackNode
  // ! вызывается в конце commitRootImpl/performSyncWorkOnRoot для сброса
  if (expirationTime === NoWork) {
    if (existingCallbackNode !== null) {
      root.callbackNode = null
      root.callbackExpirationTime = NoWork
      root.callbackPriority = NoPriority
    }

    return
  }

  // ! при повторном useState()
  if (existingCallbackNode !== null) return

  // ! для чего и вызивается этот метод в scheduleWork
  root.callbackExpirationTime = expirationTime
  root.callbackPriority = Sync
  root.callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
}

// ! вызывается 1 раз при рендере и при изменения стейта через flushSyncCallbackQueue
//!main func update
export function performSyncWorkOnRoot(root) {
  var lastExpiredTime = root.lastExpiredTime
  var expirationTime = lastExpiredTime !== NoWork ? lastExpiredTime : Sync

  // ! можно попасть только после commitRoot(который вызывается в конце функции (finishSyncRender - commitRoot)) который выставляет pendingPassiveEffectsRenderPriority если есть rootDoesHavePassiveEffects(в файбере useEffect)
  //TODO
  //flushPassiveEffects()
  // ! workInProgressRoot сбрасывается в finishSyncRender
  if (root !== workInProgressRoot) prepareFreshStack(root, expirationTime)

  // ! проверка выполнится если root = workInProgressRoot, что может случится если не вызвался finishSyncRender()
  if (workInProgress !== null) {
    var prevExecutionContext = executionContext
    executionContext |= RenderContext
    // ! сначала спускает в самый низ в beginWork
    // ! потом когда next = null, переходим к completeUnitOfWork - где создается или помечается на обновление все ноды, но не добавляются в дерево
    workLoopSync()
    executionContext = prevExecutionContext

    // ! root === workInProgressRoot
    // ! finishedWork ссылка на - #root / tag = 3
    root.finishedWork = root.current.alternate
    root.finishedExpirationTime = expirationTime
    finishSyncRender(root)
  }

  // ! для сброса колбеков
  ensureRootIsScheduled(root)

  return null
}

export function prepareFreshStack(root, expirationTime) {
  root.finishedWork = null
  root.finishedExpirationTime = NoWork

  // ! reset in finishSyncRender
  workInProgressRoot = root
  workInProgress = createWorkInProgress(root.current, null)
  renderExpirationTime$1 = expirationTime
  workInProgressRootExitStatus = RootIncomplete
  workInProgressRootFatalError = null
  workInProgressRootLatestProcessedExpirationTime = Sync
  workInProgressRootLatestSuspenseTimeout = Sync
  workInProgressRootCanSuspendUsingConfig = null
  workInProgressRootNextUnprocessedUpdateTime = NoWork
  workInProgressRootHasPendingPing = false

  spawnedWorkDuringRender = null
}

export function workLoopSync() {
  // ! 1й workInProgress выставляется в prepareFreshStack в root.current = #root / tag = 3
  while (workInProgress !== null) {
    //! возвращается 1й ребенок
    //! сначала идет в самый низ -> создается нода -> добавляются все дети -> и переход к соседу(обход уже его детей) или если нет соседа переход к родителю
    console.log(workInProgress.tag)
    workInProgress = performUnitOfWork(workInProgress)
  }
}

export function finishSyncRender(root) {
  workInProgressRoot = null
  commitRoot(root)
}

export function performUnitOfWork(unitOfWork) {
  var current = unitOfWork.alternate
  // ! спускается вниз собирает всех первых детей (обход в глубину)
  // ! создается файберы
  //! setCurrentFiber(unitOfWork)
  var next = beginWork(current, unitOfWork, renderExpirationTime$1)
  //! resetCurrentFiber()
  // ! когда согласовл деней можно запомнить пропсы
  unitOfWork.memoizedProps = unitOfWork.pendingProps
  // ! когда спустился в самый низ
  if (next === null) {
    next = completeUnitOfWork(unitOfWork)
  }
  return next
}

export function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback]
  } else {
    syncQueue.push(callback)
  }
  return fakeCallbackNode
}

export function flushSyncCallbackQueue() {
  // !isFlushingSyncQueue - используется только в этой функции для Prevent re-entrancy.
  // !syncQueue - очередь performSyncWorkOnRoot(обычно одна функция)

  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true

    try {
      var _isSync = true
      var queue = syncQueue
      for (var i = 0; i < queue.length; i++) {
        var callback = queue[i]

        do {
          callback = callback(_isSync)
        } while (callback !== null)
      }
      syncQueue = null
    } finally {
      isFlushingSyncQueue = false
    }
  }
}
