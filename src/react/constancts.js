window.noTimeout = -1

window.NoMode = 0
window.StrictMode = 1 // TODO: Remove BlockingMode and ConcurrentMode by reading from the root
// tag instead

window.BlockingMode = 2
window.ConcurrentMode = 4
window.ProfileMode = 8

window.MAX_SIGNED_31_BIT_INT = 1073741823

window.Sync = MAX_SIGNED_31_BIT_INT
window.Batched = Sync - 1
window.UNIT_SIZE = 10
window.MAGIC_NUMBER_OFFSET = Batched - 1

window.fakeCallbackNode = {}

window.ImmediatePriority = 99
window.UserBlockingPriority$1 = 98
window.NormalPriority = 97
window.LowPriority = 96
window.IdlePriority = 95 // NoPriority is the absence of priority. Also React-only.

window.NoPriority = 90

window.syncQueue = null
window.immediateQueueCallbackNode = null
window.isFlushingSyncQueue = false

window.FunctionComponent = 0
window.ClassComponent = 1
window.IndeterminateComponent = 2 // Before we know whether it is function or class
window.HostRoot = 3 // Root of a host tree. Could be nested inside another node.
window.HostPortal = 4 // A subtree. Could be an entry point to a different renderer.
window.HostComponent = 5
window.HostText = 6
window.Fragment = 7
window.Mode = 8
window.ContextConsumer = 9
window.ContextProvider = 10
window.ForwardRef = 11
window.Profiler = 12
window.SuspenseComponent = 13
window.MemoComponent = 14
window.SimpleMemoComponent = 15
window.LazyComponent = 16
window.IncompleteClassComponent = 17
window.DehydratedFragment = 18
window.SuspenseListComponent = 19
window.FundamentalComponent = 20
window.ScopeComponent = 21
window.Block = 22

window.NoEffect = 0
window.PerformedWork = 1
window.Placement = 2
window.Update = 4
window.PlacementAndUpdate = 6
window.Deletion = 8
window.ContentReset = 16
window.Callback = 32
window.DidCapture = 64
window.Ref = 128
window.Snapshot = 256
window.Passive = 512
window.Hydrating = 1024
window.HydratingAndUpdate = 1028
window.LifecycleEffectMask = 932
window.HostEffectMask = 2047
window.Incomplete = 2048
window.ShouldCapture = 4096

window.NoWork = 0
window.Never = 1
window.Idle = 2
window.ContinuousHydration = 3

window.NoContext = 0
window.BatchedContext = 1
window.EventContext = 2
window.DiscreteEventContext = 4
window.LegacyUnbatchedContext = 8
window.RenderContext = 16
window.CommitContext = 32
window.RootIncomplete = 0
window.RootFatalErrored = 1
window.RootErrored = 2
window.RootSuspended = 3
window.RootSuspendedWithDelay = 4
window.RootCompleted = 5
window.executionContext = NoContext

window.workInProgressRoot = null
window.workInProgress = null

window.globalMostRecentFallbackTime = 0
window.FALLBACK_THROTTLE_MS = 500
window.nextEffect = null
window.hasUncaughtError = false
window.firstUncaughtError = null
window.legacyErrorBoundariesThatAlreadyFailed = null
window.rootDoesHavePassiveEffects = false
window.rootWithPendingPassiveEffects = null
window.pendingPassiveEffectsRenderPriority = NoPriority
window.pendingPassiveEffectsExpirationTime = NoWork
window.rootsWithPendingDiscreteUpdates = null

window.spawnedWorkDuringRender = null

window.currentEventTime = NoWork

let currentRoot = null
let deletions = null

window.LegacyRoot = 0
window.BlockingRoot = 1
window.ConcurrentRoot = 2

window.DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML'
window.SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning'
window.SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning'
window.AUTOFOCUS = 'autoFocus'
window.CHILDREN = 'children'
window.STYLE = 'style'
window.HTML$1 = '__html'

window.ELEMENT_NODE = 1
window.TEXT_NODE = 3
window.COMMENT_NODE = 8
window.DOCUMENT_NODE = 9
window.DOCUMENT_FRAGMENT_NODE = 11

window.UpdateState = 0
window.ReplaceState = 1
window.ForceUpdate = 2
window.CaptureUpdate = 3
window.hasForceUpdate = false
window.currentlyProcessingQueue = null // ??

window.HasEffect = 1
window.Layout = 2
window.Passive$1 = 4

window.renderExpirationTime = NoWork
window.currentlyRenderingFiber$1 = null
window.ReactCurrentDispatcher = { current: null }
window.currentHook = null
window.workInProgressHook = null
