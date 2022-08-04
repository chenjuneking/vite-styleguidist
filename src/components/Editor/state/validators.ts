import { isObject, isFunction, isEmptyObject, hasOwnProperty } from '@/utils'

enum ErrorMessages {
  INITIAL_REQUIRED = 'Initial state is required',
  INITIAL_TYPE = 'Initial state should be an object',
  INITIAL_CONTENT = "Initial state shouldn't be an empty object",
  HANDLER_TYPE = 'Handler should be an object or a function',
  HANDLERS_TYPE = 'All handlers hould be a functions',
  SELECTOR_TYPE = 'Selector should be a function',
  CHANGE_TYPE = 'Provided value of changes should be an object',
  CHANGE_FIELD = "Field to be changed should be in the 'initial' state",
  DEFAULT = 'An unknown error accured',
}

const errorHandler = (errorMessage: ErrorMessages): void => {
  console.error(errorMessage)
}

function validateChanges(initial: any, changes: any): any {
  if (!isObject(changes)) errorHandler(ErrorMessages.CHANGE_TYPE)
  if (
    !Object.keys(changes).some((field: string) =>
      hasOwnProperty(initial, field)
    )
  )
    errorHandler(ErrorMessages.CHANGE_FIELD)
  return changes
}

function validateSelector(selector: any): void {
  if (!isFunction(selector)) errorHandler(ErrorMessages.SELECTOR_TYPE)
}

function validateHandler(handler: any): void {
  if (!(isFunction(handler) || isObject(handler)))
    errorHandler(ErrorMessages.HANDLER_TYPE)
  if (isObject(handler) && Object.values(handler).some((h) => !isFunction(h)))
    errorHandler(ErrorMessages.HANDLERS_TYPE)
}

function validateInitial(initial: any): void {
  if (!initial) errorHandler(ErrorMessages.INITIAL_REQUIRED)
  if (!isObject(initial)) errorHandler(ErrorMessages.INITIAL_TYPE)
  if (isEmptyObject(initial)) errorHandler(ErrorMessages.INITIAL_CONTENT)
}

const validators = {
  changes: validateChanges,
  selector: validateSelector,
  handler: validateHandler,
  initial: validateInitial,
}

export { ErrorMessages, errorHandler }
export default validators
