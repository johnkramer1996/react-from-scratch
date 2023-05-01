/**
 * createElement
 * ReactElement
 * hasValidKey
 * hasValidRef
 */
export var hasSymbol = typeof Symbol === 'function' && Symbol.for
export var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7
export var REACT_PROVIDER_TYPE = Symbol.for('react.provider')
export var REACT_CONTEXT_TYPE = Symbol.for('react.context')
export var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0
export var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb
export var REACT_MEMO_TYPE = Symbol.for('react.memo')

export function createElement(type, config, ...children) {
  let props = {}
  let key = null
  let ref = null

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref
    }

    if (hasValidKey(config)) {
      key = '' + config.key
    }
    delete config.ref
    delete config.key
  }

  props = {
    ...config,
    children: children.length === 1 ? children[0] : children,
  }

  return ReactElement(type, key, ref, props)
}

export function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render,
  }
}

export function memo(type, compare) {
  var elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: compare === undefined ? null : compare,
  }

  return elementType
}

export function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  var keysA = Object.keys(objA)
  var keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  } // Test for A's keys different from B.

  for (var i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}

function ReactElement(type, key, ref, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
  }
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get

      if (getter && getter.isReactWarning) {
        return false
      }
    }
  }

  return config.key !== undefined
}

function hasValidRef(config) {
  if (hasOwnProperty.call(config, 'ref')) {
    var getter = Object.getOwnPropertyDescriptor(config, 'ref').get

    if (getter && getter.isReactWarning) {
      return false
    }
  }

  return config.ref !== undefined
}
