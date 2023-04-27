export function completeUnitOfWork(unitOfWork) {
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
  workInProgress = unitOfWork

  // ! 03.01.23 12-06
  // ! почему в app effectTag = 7?  Placement(beginWork) + Update(useLaoutEffect) + PerformedWork(рендер)
  do {
    var current = workInProgress.alternate
    var returnFiber = workInProgress.return // Check if the work completed or if something threw.

    // !! создает или помечает на обновление ноду, другие типы игнорирует
    // !! воздращает всегда null
    //! setCurrentFiber(workInProgress)
    var next = completeWork(current, workInProgress, renderExpirationTime$1)
    //!resetCurrentFiber()
    //!resetChildExpirationTime(workInProgress)
    if (next !== null) return next

    // ! добавить еффекты в очередь, пропуская файберы где нет еффектов
    if (returnFiber !== null) {
      if (returnFiber.firstEffect === null) {
        returnFiber.firstEffect = workInProgress.firstEffect
      }

      // ! если есть еффект у детей
      if (workInProgress.lastEffect !== null) {
        // ! добавить в очередь
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
        }

        // ! переместить указатель
        returnFiber.lastEffect = workInProgress.lastEffect
      }

      var effectTag = workInProgress.effectTag

      // ! добавить сам файбер в цепочку если есть какойто еффект
      if (effectTag > PerformedWork) {
        // ! если есть последний значит уже есть первый и тогда добавляем в цепочку
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress
        } else {
          // ! если первый то добавляем
          returnFiber.firstEffect = workInProgress
        }
        // ! быстрая ссылка на последний елемент
        returnFiber.lastEffect = workInProgress
      }
    }

    // ! если есть сосед нужно обойти его детей
    var siblingFiber = workInProgress.sibling
    if (siblingFiber !== null) {
      return siblingFiber
    }

    // ! если нет соседа то пойдет к родителю
    workInProgress = returnFiber
    // ! только в хостовой ноды нет родителя
  } while (workInProgress !== null) // We've reached the root.

  // ! когда доходит до хоста то переходит к commitRoot

  // if (workInProgressRootExitStatus === RootIncomplete) {
  //   workInProgressRootExitStatus = RootCompleted
  // }

  // ! если возрат нул, то воздрат из функцции  workLoopSync - performUnitOfWork и переход к finishSyncRender
  return null
}

//! FunctionComponent / ClassComponent
//! 4.2.1.2.1.1) null
//! HostComponent
//! 4.2.1.2.1.1) createInstance + appendAllChildren +  finalizeInitialChildren -> setInitialDOMProperties
//! 4.2.1.2.1.2) updateHostComponent$1 -> markUpdate
//! HostText
//! 4.2.1.2.1.1) createTextInstance -> createTextNode
//! 4.2.1.2.1.2) updateHostText$1 -> markUpdate
export function completeWork(current, workInProgress, renderExpirationTime) {
  var newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
    case ClassComponent:
    case HostRoot:
      return null

    case HostComponent: {
      var type = workInProgress.type

      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent$1(current, workInProgress, type, newProps)
        if (current.ref !== workInProgress.ref) {
          markRef$1(workInProgress)
        }
      } else {
        if (!newProps) {
          return null
        }

        var instance = createInstance(type, newProps, workInProgress)

        appendAllChildren(instance, workInProgress, false, false)
        workInProgress.stateNode = instance

        // ! выставляется CHILDREN/STYLE/И В ВСЕ ДРУГИЕ
        // ! возращает проверку инпутов на автофокус
        if (finalizeInitialChildren(instance, type, newProps)) {
          markUpdate(workInProgress)
        }
      }

      if (workInProgress.ref !== null) {
        markRef$1(workInProgress)
      }

      return null
    }

    case HostText: {
      var newText = newProps
      debugger

      if (current !== null && workInProgress.stateNode != null) {
        var oldText = current.memoizedProps
        //! если новый текст отличается от старого то помечатеся на обновление
        updateHostText$1(current, workInProgress, oldText, newText)
      } else {
        // var _rootContainerInstance = getRootHostContainer()
        // var _currentHostContext = getHostContext()
        // var _wasHydrated2 = popHydrationState(workInProgress)
        // workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext, workInProgress)
        // ! создается нода и к свойсту прикрепляется файбер
        workInProgress.stateNode = createTextInstance(newText, workInProgress)
      }

      return null
    }
    case ContextProvider:
      return null
  }
}

export function markUpdate(workInProgress) {
  workInProgress.effectTag |= Update
}

export function markRef$1(workInProgress) {
  workInProgress.effectTag |= Ref
}

export function getPublicInstance(instance) {
  return instance
}

// ! добавляется файбер как свойсвто ноды для быстрого поиска
export function createTextInstance(text, internalInstanceHandle) {
  var textNode = document.createTextNode(text)
  precacheFiberNode(internalInstanceHandle, textNode)
  return textNode
}

// ! добавляется файбер и пропсы как свойсвто ноды для быстрого поиска
export function createInstance(type, props, internalInstanceHandle) {
  const domElement = document.createElement(type)
  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}

// ! выставляется пропсы и возрат бул на автофокус
export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props)
  // ! проверка инпутов на автофокус
  return shouldAutoFocusHostComponent(type, props)
}

// ! выставляется CHILDREN/STYLE/И В ВСЕ ДРУГИЕ
export function setInitialProperties(domElement, tag, rawProps) {
  var props

  switch (tag) {
    default:
      props = rawProps
  }

  props = rawProps

  setInitialDOMProperties(tag, domElement, props)
}

var randomKey = Math.random().toString(36).slice(2)
var internalInstanceKey = '__reactInternalInstance$' + randomKey
var internalEventHandlersKey = '__reactEventHandlers$' + randomKey
var internalContainerInstanceKey = '__reactContainere$' + randomKey
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst
}
export function updateFiberProps(node, props) {
  node[internalEventHandlersKey] = props
}

export function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || nativeEvent.srcElement || window // Normalize SVG <use> element events #4963

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}

export function getClosestInstanceFromNode(targetNode) {
  var targetInst = targetNode[internalInstanceKey]

  if (targetInst) {
    return targetInst
  } // If the direct event target isn't a React owned DOM node, we need to look
  // to see if one of its parents is a React owned DOM node.

  var parentNode = targetNode.parentNode

  while (parentNode) {
    targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]

    if (targetInst) {
      return targetInst
    }

    targetNode = parentNode
    parentNode = targetNode.parentNode
  }

  return null
}

export function getFiberCurrentPropsFromNode(node) {
  return node[internalEventHandlersKey] || null
}

export function getListener(inst, registrationName) {
  var listener // TODO: shouldPreventMouseEvent is DOM-specific and definitely should not
  // live here; needs to be moved to a better place soon

  var stateNode = inst.stateNode

  if (!stateNode) {
    // Work in progress (ex: onload events in incremental mode).
    return null
  }

  var props = getFiberCurrentPropsFromNode(stateNode)

  if (!props) {
    // Work in progress.
    return null
  }

  listener = props[registrationName]

  if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
    return null
  }

  return listener
}

export function isInteractive(tag) {
  return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea'
}

export function shouldPreventMouseEvent(name, type, props) {
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

export function setInitialDOMProperties(tag, domElement, nextProps) {
  var isCustomComponentTag = isCustomComponent(tag, nextProps)

  for (var propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) continue

    var nextProp = nextProps[propKey]
    if (propKey === STYLE) {
      if (nextProp) Object.freeze(nextProp)
      setValueForStyles(domElement, nextProp)
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        var canSetTextContent = tag !== 'textarea' || nextProp !== ''

        if (canSetTextContent) {
          setTextContent(domElement, nextProp)
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp)
      }
    } else if (propKey === AUTOFOCUS);
    else if (propKey === 'onClick') {
      if (nextProp != null);
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag)
    }
  }
}

export const setTextContent = function (node, text) {
  if (text) {
    var firstChild = node.firstChild

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text
      return
    }
  }

  node.textContent = text
}

function setValueForProperty(node, name, value, isCustomComponentTag = false) {
  var propertyInfo = getPropertyInfo(name)

  if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
    return
  }

  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null
  } // If the prop isn't in the special list, treat it as a simple attribute.

  if (isCustomComponentTag || propertyInfo === null) {
    if (isAttributeNameSafe(name)) {
      var _attributeName = name

      if (value === null) {
        node.removeAttribute(_attributeName)
      } else {
        node.setAttribute(_attributeName, '' + value)
      }
    }

    return
  }

  var mustUseProperty = propertyInfo.mustUseProperty

  if (mustUseProperty) {
    var propertyName = propertyInfo.propertyName

    if (value === null) {
      var type = propertyInfo.type
      node[propertyName] = type === BOOLEAN ? false : ''
    } else {
      // Contrary to `setAttribute`, object properties are properly
      // `toString`ed by IE8/9.
      node[propertyName] = value
    }

    return
  } // The rest are treated as attributes with special cases.

  var attributeName = propertyInfo.attributeName,
    attributeNamespace = propertyInfo.attributeNamespace

  if (value === null) {
    node.removeAttribute(attributeName)
  } else {
    var _type = propertyInfo.type
    var attributeValue

    if (_type === BOOLEAN || (_type === OVERLOADED_BOOLEAN && value === true)) {
      // If attribute type is boolean, we know for sure it won't be an execution sink
      // and we won't require Trusted Type here.
      attributeValue = ''
    } else {
      attributeValue = '' + value

      if (propertyInfo.sanitizeURL) {
        sanitizeURL(attributeValue.toString())
      }
    }

    if (attributeNamespace) {
      node.setAttributeNS(attributeNamespace, attributeName, attributeValue)
    } else {
      node.setAttribute(attributeName, attributeValue)
    }
  }
}

function setValueForStyles(node, styles) {
  var style = node.style

  for (var styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue
    }

    var isCustomProperty = styleName.indexOf('--') === 0

    {
      if (!isCustomProperty) {
        warnValidStyle$1(styleName, styles[styleName])
      }
    }

    var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty)

    if (styleName === 'float') {
      styleName = 'cssFloat'
    }

    if (isCustomProperty) {
      style.setProperty(styleName, styleValue)
    } else {
      style[styleName] = styleValue
    }
  }
}

var appendAllChildren
var updateHostContainer
var updateHostComponent$1
var updateHostText$1

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child)
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child)
}

{
  // ! простой обход дерева для добавление всех детей
  appendAllChildren = function (parent, workInProgress) {
    // ! в самом низу нет детей
    var node = workInProgress.child

    // ! ноды не добавляються в дом только в ноду
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        // ! просто добавляет node в parent
        appendChild(parent, node.stateNode)
      } else if (node.child !== null) {
        // ! если функциональный компонент то перейти к ребенку
        node = node.child
        continue
      }

      // ! если нет соседей то нужно поднятся чтобы выйти
      while (node.sibling === null) {
        // ! выход когда добавили всех детей и соседей
        if (node.return === null || node.return === workInProgress) return

        node = node.return
      }

      // ! если есть сосед - добавить
      node = node.sibling
    }
  }

  updateHostContainer = function (workInProgress) {}

  // ! пометка на обновление и обновление пропсов
  updateHostComponent$1 = function (current, workInProgress, type, newProps) {
    var oldProps = current.memoizedProps
    if (oldProps === newProps) {
      return
    }
    var instance = workInProgress.stateNode
    var updatePayload = prepareUpdate(instance, type, oldProps, newProps) // TODO: Type this specific to this type of component.

    workInProgress.updateQueue = updatePayload

    if (updatePayload) {
      markUpdate(workInProgress)
    }
  }

  // ! пометка на обновление
  updateHostText$1 = function (current, workInProgress, oldText, newText) {
    if (oldText !== newText) {
      markUpdate(workInProgress)
    }
  }
}

// ! обновление пропсов
function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps)
}

var registrationNameDependencies = {}

// ! обновление пропсов
function diffProperties(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
  var updatePayload = null
  var lastProps
  var nextProps
  lastProps = lastRawProps
  nextProps = nextRawProps

  var propKey
  var styleName
  var styleUpdates = null

  for (propKey in lastProps) {
    // ! ЕСЛИ ПРОШЛИЕ ЕСТЬ В НОВОМ ИЛИ НОВЫЕ КОТОРЫЕ НЕ БИЛЫ В ПРОШЛОМ
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue
    }

    if (propKey === STYLE) {
      var lastStyle = lastProps[propKey]

      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {}
          }

          styleUpdates[styleName] = ''
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN);
    else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    );
    else if (propKey === AUTOFOCUS);
    else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (!updatePayload) {
        updatePayload = []
      }
    } else {
      // For all other deleted properties we add it to the queue. We use
      // the allowed property list in the commit phase instead.
      ;(updatePayload = updatePayload || []).push(propKey, null)
    }
  }
  for (propKey in nextProps) {
    var nextProp = nextProps[propKey]
    var lastProp = lastProps != null ? lastProps[propKey] : undefined

    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue
    }

    if (propKey === STYLE) {
      {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp)
        }
      }

      if (lastProp) {
        // Unset styles on `lastProp` but not on `nextProp`.
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }

            styleUpdates[styleName] = ''
          }
        } // Update styles that changed since `lastProp`.

        for (styleName in nextProp) {
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) {
              styleUpdates = {}
            }

            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = []
          }

          updatePayload.push(propKey, styleUpdates)
        }

        styleUpdates = nextProp
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      var nextHtml = nextProp ? nextProp[HTML$1] : undefined
      var lastHtml = lastProp ? lastProp[HTML$1] : undefined

      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          ;(updatePayload = updatePayload || []).push(propKey, nextHtml)
        }
      }
    } else if (propKey === CHILDREN) {
      // ! обновить текст
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        ;(updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    );
    else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        if (typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp)
        }

        if (propKey === 'onScroll') {
          // listenToNonDelegatedEvent("scroll", domElement)
        }
      }

      if (!updatePayload && lastProp !== nextProp) {
        updatePayload = []
      }
    } else if (
      typeof nextProp === 'object' &&
      nextProp !== null &&
      nextProp.$$typeof === REACT_OPAQUE_ID_TYPE
    ) {
      nextProp.toString()
    } else {
      ;(updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }

  if (styleUpdates) {
    ;(updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }

  return updatePayload
}

function isCustomComponent(tagName, props) {
  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string'
  }

  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this list too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false

    default:
      return true
  }
}

export function shouldAutoFocusHostComponent(type, props) {
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus
  }

  return false
}

document.addEventListener('click', (nativeEvent) => {
  var nativeEventTarget = getEventTarget(nativeEvent)
  var targetInst = getClosestInstanceFromNode(nativeEventTarget)
  if (!targetInst) return
  var listener = getListener(targetInst, 'onClick')

  var prevExecutionContext = executionContext
  executionContext |= DiscreteEventContext

  try {
    listener(nativeEvent)
  } finally {
    executionContext = prevExecutionContext

    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      flushSyncCallbackQueue()
    }
  }
})
