import { expect, test } from 'vitest'
import {
  compose,
  curry,
  deepMerge,
  hasOwnProperty,
  isArray,
  isBoolean,
  isEmptyObject,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '.'

const fixtures = [
  {
    name: 'isNull',
    fn: isNull,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, false],
      [new Object(), false],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, false],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, true],
    ],
  },
  {
    name: 'isFunction',
    fn: isFunction,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, false],
      [new Object(), false],
      [[], false],
      [new Array(), false],
      [() => {}, true],
      [undefined, false],
      [NaN, false],
      [Symbol, true],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isObject',
    fn: isObject,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, true],
      [new Object(), true],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, false],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isArray',
    fn: isArray,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, false],
      [new Object(), false],
      [[], true],
      [new Array(), true],
      [() => {}, false],
      [undefined, false],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isString',
    fn: isString,
    argsResult: [
      [0, false],
      ['A', true],
      [`A`, true],
      [false, false],
      [{}, false],
      [new Object(), false],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, false],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isNumber',
    fn: isNumber,
    argsResult: [
      [0, true],
      [Number('0'), true],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, false],
      [new Object(), false],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, false],
      [NaN, true],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isBoolean',
    fn: isBoolean,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, true],
      [{}, false],
      [new Object(), false],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, false],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isUndefined',
    fn: isUndefined,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, false],
      [new Object(), false],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, true],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
  {
    name: 'isEmptyObject',
    fn: isEmptyObject,
    argsResult: [
      [0, false],
      ['A', false],
      [`A`, false],
      [false, false],
      [{}, true],
      [new Object(), true],
      [{ a: 1 }, false],
      [[], false],
      [new Array(), false],
      [() => {}, false],
      [undefined, false],
      [NaN, false],
      [Symbol, false],
      [Symbol(), false],
      [null, false],
    ],
  },
]

fixtures.forEach((fixture) => {
  test(`utils#${fixture.name}()`, () => {
    fixture.argsResult.forEach((item) => {
      expect(fixture.fn(item[0])).toBe(item[1])
    })
  })
})

test('utils#hasOwnProperty()', () => {
  const obj = { a: 1 }
  class Person {
    getName() {
      return 'j'
    }
  }
  const person = new Person()
  expect(obj.a).eq(1)
  expect(hasOwnProperty(obj, 'a')).toBe(true)
  expect(person.getName()).eq('j')
  expect(hasOwnProperty(person, 'getName')).toBe(false)
})

test('utils#deepMerge()', () => {
  const target = {
    a1: 'a1',
    b1: {
      c1: 'c1',
      d1: 'd1',
    },
  }
  const source = {
    e2: 'e2',
    b1: {
      d1: 'd2',
      f2: 'f2',
    },
  }
  expect(deepMerge(target, source)).deep.eq({
    a1: 'a1',
    e2: 'e2',
    b1: {
      c1: 'c1',
      d1: 'd2',
      f2: 'f2',
    },
  })
})

test('utils#compose()', () => {
  const logs: string[] = []
  function create(name: string) {
    logs.push(`Person ${name} created.`)
    return { name, age: 21 }
  }
  function setAge({ name, age }: { name: string; age: number }) {
    logs.push(`Person ${name}'s age was setted to ${age}.`)
    return { name, status: 'running' }
  }
  function setStatus({ name, status }: { name: string; status: string }) {
    logs.push(`Person ${name} now is ${status}.`)
  }
  compose(setStatus, setAge, create)('Jacket')
  expect(logs.length).eq(3)
  expect(logs[0]).eq('Person Jacket created.')
  expect(logs[1]).eq("Person Jacket's age was setted to 21.")
  expect(logs[2]).eq('Person Jacket now is running.')
})

test('utils#curry()', () => {
  function sum(a: number, b: number, c: number) {
    return a + b + c
  }
  const curried = curry(sum)
  expect(curried(1, 2, 3)).eq(6)
  expect(curried(1, 2, 3, 4)).eq(6)
  expect(curried(1, 2)(3)).eq(6)
  expect(curried(1)(2, 3)).eq(6)
  expect(curried(1)(2)(3)).eq(6)
})
