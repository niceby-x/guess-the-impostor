import { describe, expect, it } from 'vitest'
import { secureRandomInt, secureShuffle } from '../src/game/random.js'

describe('secureRandomInt', () => {
  it('always returns a whole number in range', () => {
    for (let i = 0; i < 2000; i++) {
      const n = secureRandomInt(7)
      expect(Number.isInteger(n)).toBe(true)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(7)
    }
  })
  it('returns 0 when the only option is 1', () => {
    expect(secureRandomInt(1)).toBe(0)
  })
  it('rejects invalid limits', () => {
    expect(() => secureRandomInt(0)).toThrow()
    expect(() => secureRandomInt(-3)).toThrow()
    expect(() => secureRandomInt(2.5)).toThrow()
  })
})

describe('secureShuffle', () => {
  it('keeps exactly the same items', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    expect([...secureShuffle(items)].sort()).toEqual(items)
  })
  it('does not change the original array', () => {
    const items = ['a', 'b', 'c', 'd']
    secureShuffle(items)
    expect(items).toEqual(['a', 'b', 'c', 'd'])
  })
  it('is predictable when given a fixed random function', () => {
    // randomInt that always returns 0 moves each item to the front in turn.
    expect(secureShuffle(['a', 'b', 'c'], () => 0)).toEqual(['b', 'c', 'a'])
  })
  it('handles empty and single-item arrays', () => {
    expect(secureShuffle([])).toEqual([])
    expect(secureShuffle(['x'])).toEqual(['x'])
  })
})
