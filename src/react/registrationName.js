var TOP_BLUR = 'blur'
var TOP_CANCEL = 'cancel'
var TOP_CLICK = 'click'
var TOP_CLOSE = 'close'
var TOP_CONTEXT_MENU = 'contextmenu'
var TOP_COPY = 'copy'
var TOP_CUT = 'cut'
var TOP_DOUBLE_CLICK = 'dblclick'
var TOP_AUX_CLICK = 'auxclick'
var TOP_DRAG_END = 'dragend'
var TOP_DRAG_START = 'dragstart'
var TOP_DROP = 'drop'
var TOP_FOCUS = 'focus'
var TOP_INPUT = 'input'
var TOP_INVALID = 'invalid'
var TOP_KEY_DOWN = 'keydown'
var TOP_KEY_PRESS = 'keypress'
var TOP_KEY_UP = 'keyup'
var TOP_MOUSE_DOWN = 'mousedown'
var TOP_MOUSE_UP = 'mouseup'
var TOP_PASTE = 'paste'
var TOP_PAUSE = 'pause'
var TOP_PLAY = 'play'
var TOP_POINTER_CANCEL = 'pointercancel'
var TOP_POINTER_DOWN = 'pointerdown'
var TOP_POINTER_UP = 'pointerup'
var TOP_RATE_CHANGE = 'ratechange'
var TOP_RESET = 'reset'
var TOP_SEEKED = 'seeked'
var TOP_SUBMIT = 'submit'
var TOP_TOUCH_CANCEL = 'touchcancel'
var TOP_TOUCH_END = 'touchend'
var TOP_TOUCH_START = 'touchstart'
var TOP_VOLUME_CHANGE = 'volumechange'

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
export var registrationNameDependencies = {}
export var simpleEventPluginEventTypes = {}

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
