/**
 * createElement
 * ReactElement
 * hasValidKey
 * hasValidRef
 */
export var hasSymbol = typeof Symbol === 'function' && Symbol.for
export var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7

function createElement(type, config, ...children) {
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

export { createElement, ReactElement, hasValidKey }
