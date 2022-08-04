import validators from './validators'
import { IState, TGetStateHandler, TSetStateHandler } from './state.types'
import { TVoidFunction } from '@/components/types'
import { curry, compose, isObject, hasOwnProperty } from '@/utils'

function create<T>(
  initial: T,
  handler = {}
): [TGetStateHandler<T>, TSetStateHandler<T>] {
  validators.initial(initial)
  validators.handler(handler)

  const state = { current: initial }
  const didUpdate = curry(didStateUpdate)(state, handler)
  const update = curry(updateState)(state)
  const getChanges = curry(extractChanges)(state)
  const validate = curry(validators.changes)(initial)

  function getState(selector = (stateValue: T) => stateValue) {
    validators.selector(selector)
    return selector(state.current)
  }

  function setState<T>(causedChanges: Partial<T> | ((state: T) => Partial<T>)) {
    compose(didUpdate, update, validate, getChanges)(causedChanges)
  }

  return [getState, setState]
}

function updateState<T>(state: IState<T>, changes: T): T {
  state.current = { ...state.current, ...changes }
  return changes
}

function extractChanges<T>(
  state: IState<T>,
  causedChanges: Partial<T> | ((state: T) => Partial<T>)
): Partial<T> | T {
  return causedChanges instanceof Function
    ? causedChanges(state.current)
    : causedChanges
}

function didStateUpdate<T>(
  state: IState<T>,
  handler: TVoidFunction,
  changes: T
): T {
  if (typeof handler === 'function') {
    handler(state.current)
  } else if (isObject(handler)) {
    Object.keys(changes).forEach((key: string) => {
      if (hasOwnProperty(handler, key) && typeof handler[key] === 'function') {
        const h = handler[key] as TVoidFunction
        h((state.current as Record<string, any>)[key])
      }
    })
  }
  return changes
}

export default { create }
