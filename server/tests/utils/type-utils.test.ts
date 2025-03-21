import { ONBOARDING_STATUS } from '../../constants'
import {
  asDate,
  asFunction,
  asArray,
  asBoolean,
  asNumber,
  asString,
  asCamelCaseString,
  asEnum,
  asUnion,
  asOptional,
  asFactory,
} from '../../utils/type-utils'

describe('asFactory', () => {
  test('Should coerce strings to numbers and throw if not a number', () => {
    const asTestData = asFactory<{ num: number; negNum: number }>({
      num: asNumber,
      negNum: asNumber,
    })
    const coerced = asTestData({ num: '1', negNum: '-982' })
    expect(coerced.num).toEqual(1)
    expect(coerced.negNum).toEqual(-982)
    expect(() => asTestData({ num: true, negNum: 'false' })).toThrow()
  })

  test('Should coerce strings to booleans and throw if not a boolean', () => {
    const asTestData = asFactory<{ boolTrue: boolean; boolFalse: boolean }>({
      boolTrue: asBoolean,
      boolFalse: asBoolean,
    })
    const coerced = asTestData({ boolTrue: 'true', boolFalse: 'false' })
    expect(coerced.boolTrue).toEqual(true)
    expect(coerced.boolFalse).toEqual(false)
    expect(() => asTestData({ boolTrue: '1', boolFalse: '0' })).toThrow()
  })

  test('Should coerce strings to their enum values and throw if not a value in the enum', () => {
    enum TestEnum {
      KEY = 'VALUE',
    }
    const asTestData = asFactory<{ enumValue: TestEnum }>({
      enumValue: asEnum(TestEnum),
    })
    expect(() => asTestData({ enumValue: 'VALUE' })).not.toThrow()
    expect(() => asTestData({ enumValue: 'MEOW' })).toThrow()
  })

  test('Should coerce strings to dates and throw if not a date', () => {
    const asTestData = asFactory<{ date: Date }>({
      date: asDate,
    })
    let coerced = asTestData({ date: '2025-01-02T00:09:45' })
    expect(typeof coerced.date.getMonth).toBe('function')
    coerced = asTestData({ date: '2025-10-14' })
    expect(typeof coerced.date.getMonth).toBe('function')
    expect(() => asTestData({ date: '2025-13-32' })).toThrow()
    expect(() => asTestData({ date: 'meow' })).toThrow()
    expect(() => asTestData({ date: 123 })).toThrow()
    expect(() => asTestData({ date: true })).toThrow()
    expect(() => asTestData({ date: 1741652866308 })).toThrow()
  })
})

describe('asNumber', () => {
  // This is not a Date, what was this test trying to do?
  test('Should pass if given a type Date', () => {
    const id = 5 as unknown
    expect(() => asNumber(id)).not.toThrow()
  })

  test('Should pass if given an int or float', () => {
    expect(() => asNumber(999999)).not.toThrow()
    expect(() => asNumber(345.1231543534)).not.toThrow()
    expect(() => asNumber(-45)).not.toThrow()
    expect(() => asNumber(-9874.235912)).not.toThrow()
    expect(() => asNumber(-0)).not.toThrow()
    expect(() => asNumber(0)).not.toThrow()
  })

  test('Should pass if given a string coercible to a number', () => {
    expect(() => asNumber('5')).not.toThrow()
    expect(() => asNumber('.50')).not.toThrow()
    expect(() => asNumber('5.0')).not.toThrow()
  })

  test('Should throw error if not given a number', () => {
    expect(() => asNumber({} as unknown)).toThrow()
    expect(() => asNumber('hello' as unknown)).toThrow()
    expect(() => asNumber(null as unknown)).toThrow()
    expect(() => asNumber(undefined as unknown)).toThrow()
    expect(() => asNumber([] as unknown)).toThrow()
    expect(() => asNumber('e')).toThrow()
    expect(() => asNumber('pi')).toThrow()
  })
})

describe('asCamelCaseString', () => {
  test('Should pass if given a string', () => {
    expect(() => asCamelCaseString('hi')).not.toThrow()
    expect(() => asCamelCaseString('')).not.toThrow()
    expect(() =>
      asCamelCaseString('string with a bunch of spaces and such')
    ).not.toThrow()
  })

  test('Should camel case the string', () => {
    expect(asCamelCaseString('ALL CAPS')).toBe('allCaps')
    expect(asCamelCaseString('all lowercase words to camel case')).toBe(
      'allLowercaseWordsToCamelCase'
    )
  })

  test('Should throw error if not given a string', () => {
    expect(() => asCamelCaseString({})).toThrow()
    expect(() => asCamelCaseString(1)).toThrow()
    expect(() => asCamelCaseString([])).toThrow()
  })

  test('Should pass if used with isOptional and no string provided', () => {
    const asTestData = asFactory<{ str?: string }>({
      str: asOptional(asCamelCaseString),
    })
    expect(() => asTestData({ str: undefined })).not.toThrow()
  })

  test('Should pass if used with isOptional and string provided', () => {
    const asTestData = asFactory<{ str?: string }>({
      str: asOptional(asCamelCaseString),
    })
    expect(() => asTestData({ str: 'string here' })).not.toThrow()
  })
})

describe('asArray', () => {
  test('Should pass if given correct array type', () => {
    expect(() => asArray(asNumber)([1, 2, 3] as unknown)).not.toThrow()
    expect(() => asArray(asString)(['1', '2', '3'] as unknown)).not.toThrow()
    expect(() =>
      asArray(asBoolean)([true, false, true] as unknown)
    ).not.toThrow()
  })

  test('Should throw error if given wrong type', () => {
    expect(() => asArray(asBoolean)([1, 2, 3] as unknown)).toThrow()
    expect(() => asArray(asString)([1, 2, 3] as unknown)).toThrow()
    expect(() => asArray(asNumber)(['hey', 'hello', 'hi'] as unknown)).toThrow()
  })
})

describe('asDate', () => {
  test('Should pass if given a type Date', () => {
    const id = new Date() as unknown
    expect(() => asDate(id)).not.toThrow()
  })

  test('Should throw error if not given an ObjectId', () => {
    expect(() => asDate({} as unknown)).toThrow()
    expect(() => asDate(1 as unknown)).toThrow()
    expect(() => asDate('hello' as unknown)).toThrow()
    expect(() => asDate(null as unknown)).toThrow()
    expect(() => asDate(undefined as unknown)).toThrow()
    expect(() => asDate([] as unknown)).toThrow()
  })
})

describe('asFunction', () => {
  test('Should pass if given a type Function', () => {
    function namedFunction() {
      return ''
    }
    const arrowFunction = () => ''
    const anonymousFunction = function () {
      return ''
    }
    expect(() => asFunction(namedFunction)).not.toThrow()
    expect(() => asFunction(arrowFunction)).not.toThrow()
    expect(() => asFunction(anonymousFunction)).not.toThrow()
  })

  test('Should throw error if not given an ObjectId', () => {
    expect(() => asFunction({} as unknown)).toThrow()
    expect(() => asFunction(1 as unknown)).toThrow()
    expect(() => asFunction('hello' as unknown)).toThrow()
    expect(() => asFunction(null as unknown)).toThrow()
    expect(() => asFunction(undefined as unknown)).toThrow()
    expect(() => asFunction([] as unknown)).toThrow()
  })
})

describe('asEnum', () => {
  test('Should pass if given a type ONBOARDING_STATUS', () => {
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(ONBOARDING_STATUS.INACTIVE)
    ).not.toThrow()
  })

  test('Should throw error if not given an ONBOARDING_STATUS', () => {
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)({} as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(1 as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)('hello' as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(null as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)(undefined as unknown)
    ).toThrow()
    expect(() =>
      asEnum<ONBOARDING_STATUS>(ONBOARDING_STATUS)([] as unknown)
    ).toThrow()
  })
})

describe('asUnion', () => {
  test('Should pass if one of the union types', () => {
    expect(() =>
      asUnion<number | string>([asNumber, asString])(2)
    ).not.toThrow()
    expect(() =>
      asUnion<number | string>([asNumber, asString])('2')
    ).not.toThrow()
  })

  test('Should throw error if not one of the union types', () => {
    expect(() =>
      asUnion<number | string>([asNumber, asString])({} as unknown)
    ).toThrow()
    expect(() =>
      asUnion<boolean | string>([asBoolean, asString])(1 as unknown)
    ).toThrow()
    expect(() =>
      asUnion<number | boolean>([asNumber, asBoolean])('hello' as unknown)
    ).toThrow()
    expect(() =>
      asUnion<number | string[]>([asNumber, asArray(asString)])(null as unknown)
    ).toThrow()
    expect(() =>
      asUnion<string | boolean>([asString, asBoolean])(undefined as unknown)
    ).toThrow()
    expect(() =>
      asUnion<number | string>([asNumber, asString])([] as unknown)
    ).toThrow()
  })
})
