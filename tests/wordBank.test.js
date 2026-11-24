import { describe, expect, it } from 'vitest'
import {
  isUsablePair,
  selectWordPair,
  validateWordBank,
  wordBank,
} from '../src/game/wordBank.js'

const pair = (id, word, clue, enabled = true) => ({ id, word, impostorClue: clue, enabled })

describe('the shipped word bank (wordPairs.json)', () => {
  it('is valid', () => {
    expect(validateWordBank(wordBank)).toEqual({ valid: true, errors: [] })
  })
  it('has at least the 10 starter pairs, all usable', () => {
    expect(wordBank.length).toBeGreaterThanOrEqual(10)
    expect(wordBank.every(isUsablePair)).toBe(true)
  })
  it('contains the guide examples', () => {
    const dog = wordBank.find((p) => p.word === 'DOG')
    expect(dog.impostorClue).toBe('BARKS')
  })
})

describe('isUsablePair', () => {
  it('accepts a complete enabled pair', () => {
    expect(isUsablePair(pair('a', 'DOG', 'BARKS'))).toBe(true)
  })
  it('rejects disabled, incomplete, or identical pairs', () => {
    expect(isUsablePair(pair('a', 'DOG', 'BARKS', false))).toBe(false)
    expect(isUsablePair(pair('a', 'DOG', ''))).toBe(false)
    expect(isUsablePair(pair('a', '  ', 'BARKS'))).toBe(false)
    expect(isUsablePair(pair('a', 'DOG', 'dog'))).toBe(false)
    expect(isUsablePair(null)).toBe(false)
  })
})

describe('validateWordBank', () => {
  it('rejects an empty or non-array bank', () => {
    expect(validateWordBank([]).valid).toBe(false)
    expect(validateWordBank(undefined).valid).toBe(false)
  })
  it('catches duplicate ids', () => {
    const result = validateWordBank([pair('a', 'DOG', 'BARKS'), pair('a', 'CAT', 'MEOWS')])
    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toMatch(/duplicate id/)
  })
  it('catches a clue that is or contains the word', () => {
    expect(validateWordBank([pair('a', 'DOG', 'dog')]).valid).toBe(false)
    expect(validateWordBank([pair('a', 'DOG', 'DOGGY')]).valid).toBe(false)
  })
  it('catches missing fields', () => {
    expect(validateWordBank([{ id: 'a', word: 'DOG' }]).valid).toBe(false)
  })
})

describe('selectWordPair', () => {
  const bank = [pair('a', 'DOG', 'BARKS'), pair('b', 'PIZZA', 'CHEESE'), pair('c', 'CAMERA', 'LENS')]

  it('returns one enabled complete pair', () => {
    expect(isUsablePair(selectWordPair(bank))).toBe(true)
  })
  it('never returns a disabled pair', () => {
    const mixed = [pair('a', 'DOG', 'BARKS', false), pair('b', 'PIZZA', 'CHEESE')]
    for (let i = 0; i < 50; i++) expect(selectWordPair(mixed).id).toBe('b')
  })
  it('returns null for an empty, invalid, or all-disabled bank', () => {
    expect(selectWordPair([])).toBeNull()
    expect(selectWordPair()).not.toBeNull() // with no arguments it uses the shipped bank
    expect(selectWordPair([pair('a', 'DOG', 'BARKS', false)])).toBeNull()
    expect(selectWordPair('nonsense')).toBeNull()
  })
  it('does not repeat the previous pair when 2+ are usable', () => {
    for (let i = 0; i < 200; i++) expect(selectWordPair(bank, 'a').id).not.toBe('a')
  })
  it('allows the same pair when it is the only usable one', () => {
    const single = [pair('a', 'DOG', 'BARKS')]
    expect(selectWordPair(single, 'a').id).toBe('a')
  })
  it('uses the injected random function', () => {
    expect(selectWordPair(bank, null, () => 2).id).toBe('c')
  })
  it('does not crash if the last id is not in the bank', () => {
    expect(selectWordPair(bank, 'zzz')).not.toBeNull()
  })
})
