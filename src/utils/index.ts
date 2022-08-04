import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'
export { makeCancelable } from './makeCancelable'
export { resizeObserver, type IResizeObserver } from './resizeObserver'

export function isNull(o: any): boolean {
  return o === null
}

export const isFunction = isType('Function')

export const isObject = isType('Object')

export const isArray = Array.isArray || isType('Array')

export const isString = isType('String')

export const isNumber = isType('Number')

export const isBoolean = isType('Boolean')

export const isUndefined = isType('Undefined')

export function isEmptyObject(obj: any): boolean {
  if (!isObject(obj)) return false
  return !Object.keys(obj).length
}

export function hasOwnProperty(obj: any, prop: any): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export const compose =
  (...fns: Function[]) =>
  (x: any): any =>
    fns.reduceRight((y, f) => f(y), x)

export const deepMerge = (
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> => {
  Object.keys(source).forEach((key: string) => {
    if (source[key] instanceof Object && target[key]) {
      Object.assign(source[key], deepMerge(target[key], source[key]))
    }
  })
  return { ...target, ...source }
}

export function curry(fn: Function) {
  return function curried(this: void, ...args: any[]): any {
    return args.length >= fn.length
      ? fn.apply(this, args as any)
      : (...nextArgs: any[]) => curried.apply(this, [...args, ...nextArgs])
  }
}

function isType(type: string): (o: any) => boolean {
  return (o: any) => {
    return Object.prototype.toString.call(o) === `[object ${type}]`
  }
}

export function debounce(fn: Function, delay = 100) {
  let timer: any
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export function utoa(data: string): string {
  // string -> Unit8Array
  const buffer = strToU8(data)
  // compress data with zlib
  const zipped = zlibSync(buffer, { level: 9 })
  // convert a Unit8Array to a string
  const str = strFromU8(zipped, true)
  // Decodes a string into bytes using Latin-1 (ISO-8859), and encodes those bytes into a string using Base64.
  return btoa(str)
}

export function atou(base64: string): string {
  const str = atob(base64)
  // zlib header (x78), level 9 (xDA)
  if (str.startsWith('\x78\xDA')) {
    const buffer = strToU8(str, true)
    const unzipped = unzlibSync(buffer)
    return strFromU8(unzipped)
  }
  // old unicode hacks for backward compatibility
  // https://base64.guru/developers/javascript/examples/unicode-strings
  return decodeURIComponent(escape(str))
}

export function serialize(data: any): string {
  return utoa(JSON.stringify(data))
}

export function unserialize(data: string): any {
  return JSON.parse(atou(data))
}
