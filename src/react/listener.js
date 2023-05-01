import { internalEventHandlersKey, internalInstanceKey } from './instance'
import { flushSyncCallbackQueue } from './scheduleUpdateOnFiber'

function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window // Normalize SVG <use> element events #4963

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}

function getClosestInstanceFromNode(targetNode) {
  var targetInst = targetNode[internalInstanceKey]
  if (targetInst) return targetInst

  var parentNode = targetNode.parentNode
  while (parentNode) {
    targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]

    if (targetInst) return targetInst

    targetNode = parentNode
    parentNode = targetNode.parentNode
  }

  return null
}

function getFiberCurrentPropsFromNode(node) {
  return node[internalEventHandlersKey] || null
}

function getListener(inst, registrationName) {
  var listener
  var stateNode = inst.stateNode
  if (!stateNode) return null
  var props = getFiberCurrentPropsFromNode(stateNode)
  if (!props) return null

  listener = props[registrationName]
  if (shouldPreventMouseEvent(registrationName, inst.type, props)) return null

  return listener
}

function isInteractive(tag) {
  return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea'
}

function shouldPreventMouseEvent(name, type, props) {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
    case 'onMouseEnter':
      return !!(props.disabled && isInteractive(type))

    default:
      return false
  }
}

function attemptToDispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
  var nativeEventTarget = getEventTarget(nativeEvent)
  var targetInst = getClosestInstanceFromNode(nativeEventTarget)
  if (!targetInst) return
  var registrationName =
    simpleEventPluginEventTypes[nativeEvent.type].phasedRegistrationNames['bubbled']

  var listener = getListener(targetInst, registrationName)

  var prevExecutionContext = executionContext
  executionContext |= DiscreteEventContext

  try {
    listener(nativeEvent)
  } finally {
    executionContext = prevExecutionContext

    if (executionContext === NoContext) flushSyncCallbackQueue()
  }
}

function dispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
  attemptToDispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent)
}

function discreteUpdates$1(fn, a, b, c, d) {
  return fn(a, b, c, d)
}

function dispatchDiscreteEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
  discreteUpdates(dispatchEvent, topLevelType, eventSystemFlags, container, nativeEvent)
}

function discreteUpdates(fn, a, b, c, d) {
  return discreteUpdates$1(fn, a, b, c, d)
}

var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
var elementListenerMap = new PossiblyWeakMap()
function getListenerMapForElement(element) {
  var listenerMap = elementListenerMap.get(element)

  if (listenerMap === undefined) {
    listenerMap = new Map()
    elementListenerMap.set(element, listenerMap)
  }

  return listenerMap
}

export function ensureListeningTo(rootContainerElement, registrationName) {
  legacyListenToEvent(registrationName, rootContainerElement)
}

function legacyListenToEvent(registrationName, mountAt) {
  var listenerMap = getListenerMapForElement(mountAt)
  var dependencies = registrationNameDependencies[registrationName] || []

  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i]
    legacyListenToTopLevelEvent(dependency, mountAt, listenerMap)
  }
}
function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
  if (!listenerMap.has(topLevelType)) {
    trapBubbledEvent(topLevelType, mountAt)

    listenerMap.set(topLevelType, null)
  }
}

function trapBubbledEvent(topLevelType, element) {
  trapEventForPluginEventSystem(element, topLevelType, false)
}

function trapEventForPluginEventSystem(container, topLevelType, capture) {
  var listener = dispatchDiscreteEvent.bind(null, topLevelType, 1, container)
  var rawEventName = topLevelType

  if (capture) addEventCaptureListener(container, rawEventName, listener)
  else addEventBubbleListener(container, rawEventName, listener)
}

function addEventBubbleListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, false)
}
function addEventCaptureListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, true)
}

function unsafeCastStringToDOMTopLevelType(topLevelType) {
  return topLevelType
}
function unsafeCastDOMTopLevelTypeToString(topLevelType) {
  return topLevelType
}

var TOP_BLUR = unsafeCastStringToDOMTopLevelType('blur')
var TOP_CAN_PLAY = unsafeCastStringToDOMTopLevelType('canplay')
var TOP_CAN_PLAY_THROUGH = unsafeCastStringToDOMTopLevelType('canplaythrough')
var TOP_CANCEL = unsafeCastStringToDOMTopLevelType('cancel')
var TOP_CHANGE = unsafeCastStringToDOMTopLevelType('change')
var TOP_CLICK = unsafeCastStringToDOMTopLevelType('click')
var TOP_CLOSE = unsafeCastStringToDOMTopLevelType('close')
var TOP_COMPOSITION_END = unsafeCastStringToDOMTopLevelType('compositionend')
var TOP_COMPOSITION_START = unsafeCastStringToDOMTopLevelType('compositionstart')
var TOP_COMPOSITION_UPDATE = unsafeCastStringToDOMTopLevelType('compositionupdate')
var TOP_CONTEXT_MENU = unsafeCastStringToDOMTopLevelType('contextmenu')
var TOP_COPY = unsafeCastStringToDOMTopLevelType('copy')
var TOP_CUT = unsafeCastStringToDOMTopLevelType('cut')
var TOP_DOUBLE_CLICK = unsafeCastStringToDOMTopLevelType('dblclick')
var TOP_AUX_CLICK = unsafeCastStringToDOMTopLevelType('auxclick')
var TOP_DRAG = unsafeCastStringToDOMTopLevelType('drag')
var TOP_DRAG_END = unsafeCastStringToDOMTopLevelType('dragend')
var TOP_DRAG_ENTER = unsafeCastStringToDOMTopLevelType('dragenter')
var TOP_DRAG_EXIT = unsafeCastStringToDOMTopLevelType('dragexit')
var TOP_DRAG_LEAVE = unsafeCastStringToDOMTopLevelType('dragleave')
var TOP_DRAG_OVER = unsafeCastStringToDOMTopLevelType('dragover')
var TOP_DRAG_START = unsafeCastStringToDOMTopLevelType('dragstart')
var TOP_DROP = unsafeCastStringToDOMTopLevelType('drop')
var TOP_DURATION_CHANGE = unsafeCastStringToDOMTopLevelType('durationchange')
var TOP_EMPTIED = unsafeCastStringToDOMTopLevelType('emptied')
var TOP_ENCRYPTED = unsafeCastStringToDOMTopLevelType('encrypted')
var TOP_ENDED = unsafeCastStringToDOMTopLevelType('ended')
var TOP_ERROR = unsafeCastStringToDOMTopLevelType('error')
var TOP_FOCUS = unsafeCastStringToDOMTopLevelType('focus')
var TOP_GOT_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType('gotpointercapture')
var TOP_INPUT = unsafeCastStringToDOMTopLevelType('input')
var TOP_INVALID = unsafeCastStringToDOMTopLevelType('invalid')
var TOP_KEY_DOWN = unsafeCastStringToDOMTopLevelType('keydown')
var TOP_KEY_PRESS = unsafeCastStringToDOMTopLevelType('keypress')
var TOP_KEY_UP = unsafeCastStringToDOMTopLevelType('keyup')
var TOP_LOAD = unsafeCastStringToDOMTopLevelType('load')
var TOP_LOAD_START = unsafeCastStringToDOMTopLevelType('loadstart')
var TOP_LOADED_DATA = unsafeCastStringToDOMTopLevelType('loadeddata')
var TOP_LOADED_METADATA = unsafeCastStringToDOMTopLevelType('loadedmetadata')
var TOP_LOST_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType('lostpointercapture')
var TOP_MOUSE_DOWN = unsafeCastStringToDOMTopLevelType('mousedown')
var TOP_MOUSE_MOVE = unsafeCastStringToDOMTopLevelType('mousemove')
var TOP_MOUSE_OUT = unsafeCastStringToDOMTopLevelType('mouseout')
var TOP_MOUSE_OVER = unsafeCastStringToDOMTopLevelType('mouseover')
var TOP_MOUSE_UP = unsafeCastStringToDOMTopLevelType('mouseup')
var TOP_PASTE = unsafeCastStringToDOMTopLevelType('paste')
var TOP_PAUSE = unsafeCastStringToDOMTopLevelType('pause')
var TOP_PLAY = unsafeCastStringToDOMTopLevelType('play')
var TOP_PLAYING = unsafeCastStringToDOMTopLevelType('playing')
var TOP_POINTER_CANCEL = unsafeCastStringToDOMTopLevelType('pointercancel')
var TOP_POINTER_DOWN = unsafeCastStringToDOMTopLevelType('pointerdown')
var TOP_POINTER_MOVE = unsafeCastStringToDOMTopLevelType('pointermove')
var TOP_POINTER_OUT = unsafeCastStringToDOMTopLevelType('pointerout')
var TOP_POINTER_OVER = unsafeCastStringToDOMTopLevelType('pointerover')
var TOP_POINTER_UP = unsafeCastStringToDOMTopLevelType('pointerup')
var TOP_PROGRESS = unsafeCastStringToDOMTopLevelType('progress')
var TOP_RATE_CHANGE = unsafeCastStringToDOMTopLevelType('ratechange')
var TOP_RESET = unsafeCastStringToDOMTopLevelType('reset')
var TOP_SCROLL = unsafeCastStringToDOMTopLevelType('scroll')
var TOP_SEEKED = unsafeCastStringToDOMTopLevelType('seeked')
var TOP_SEEKING = unsafeCastStringToDOMTopLevelType('seeking')
var TOP_SELECTION_CHANGE = unsafeCastStringToDOMTopLevelType('selectionchange')
var TOP_STALLED = unsafeCastStringToDOMTopLevelType('stalled')
var TOP_SUBMIT = unsafeCastStringToDOMTopLevelType('submit')
var TOP_SUSPEND = unsafeCastStringToDOMTopLevelType('suspend')
var TOP_TEXT_INPUT = unsafeCastStringToDOMTopLevelType('textInput')
var TOP_TIME_UPDATE = unsafeCastStringToDOMTopLevelType('timeupdate')
var TOP_TOGGLE = unsafeCastStringToDOMTopLevelType('toggle')
var TOP_TOUCH_CANCEL = unsafeCastStringToDOMTopLevelType('touchcancel')
var TOP_TOUCH_END = unsafeCastStringToDOMTopLevelType('touchend')
var TOP_TOUCH_MOVE = unsafeCastStringToDOMTopLevelType('touchmove')
var TOP_TOUCH_START = unsafeCastStringToDOMTopLevelType('touchstart')
var TOP_VOLUME_CHANGE = unsafeCastStringToDOMTopLevelType('volumechange')
var TOP_WAITING = unsafeCastStringToDOMTopLevelType('waiting')
var TOP_WHEEL = unsafeCastStringToDOMTopLevelType('wheel')

var discreteEventPairsForSimpleEventPlugin = [
  TOP_BLUR,
  'blur',
  TOP_CANCEL,
  'cancel',
  TOP_CLICK,
  'click',
  TOP_CLOSE,
  'close',
  TOP_CONTEXT_MENU,
  'contextMenu',
  TOP_COPY,
  'copy',
  TOP_CUT,
  'cut',
  TOP_AUX_CLICK,
  'auxClick',
  TOP_DOUBLE_CLICK,
  'doubleClick',
  TOP_DRAG_END,
  'dragEnd',
  TOP_DRAG_START,
  'dragStart',
  TOP_DROP,
  'drop',
  TOP_FOCUS,
  'focus',
  TOP_INPUT,
  'input',
  TOP_INVALID,
  'invalid',
  TOP_KEY_DOWN,
  'keyDown',
  TOP_KEY_PRESS,
  'keyPress',
  TOP_KEY_UP,
  'keyUp',
  TOP_MOUSE_DOWN,
  'mouseDown',
  TOP_MOUSE_UP,
  'mouseUp',
  TOP_PASTE,
  'paste',
  TOP_PAUSE,
  'pause',
  TOP_PLAY,
  'play',
  TOP_POINTER_CANCEL,
  'pointerCancel',
  TOP_POINTER_DOWN,
  'pointerDown',
  TOP_POINTER_UP,
  'pointerUp',
  TOP_RATE_CHANGE,
  'rateChange',
  TOP_RESET,
  'reset',
  TOP_SEEKED,
  'seeked',
  TOP_SUBMIT,
  'submit',
  TOP_TOUCH_CANCEL,
  'touchCancel',
  TOP_TOUCH_END,
  'touchEnd',
  TOP_TOUCH_START,
  'touchStart',
  TOP_VOLUME_CHANGE,
  'volumeChange',
]

export var registrationNameModules = {}
var registrationNameDependencies = {}
var simpleEventPluginEventTypes = {}

function processSimpleEventPluginPairsByPriority(eventTypes) {
  for (var i = 0; i < eventTypes.length; i++) {
    var event = eventTypes[i]
    var capitalizedEvent = event[0].toUpperCase() + event.slice(1)
    var onEvent = 'on' + capitalizedEvent
  }

  for (var i = 0; i < eventTypes.length; i += 2) {
    var topEvent = eventTypes[i]
    var event = eventTypes[i + 1]
    var capitalizedEvent = event[0].toUpperCase() + event.slice(1)
    var onEvent = 'on' + capitalizedEvent
    var config = {
      phasedRegistrationNames: {
        bubbled: onEvent,
        captured: onEvent + 'Capture',
      },
      dependencies: [topEvent],
    }

    registrationNameModules[onEvent] = topEvent
    registrationNameDependencies[onEvent] = [topEvent]
    simpleEventPluginEventTypes[event] = config
  }
}

processSimpleEventPluginPairsByPriority(discreteEventPairsForSimpleEventPlugin)
