import { describe, expect, it } from 'vitest'
import {
  cleanName,
  getImpostorRange,
  validateImpostorCount,
  validatePlayers,
  validateSetup,
} from '../src/game/validateSetup.js'

const four = ['Alex', 'Jamie', 'Sam', 'Riley']

describe('cleanName', () => {
  it('trims and collapses spaces', () => {
    expect(cleanName('  Alex   B ')).toBe('Alex B')
  })
  it('handles non-strings safely', () => {
    expect(cleanName(undefined)).toBe('')
    expect(cleanName(null)).toBe('')
  })
})

describe('validatePlayers', () => {
  it('accepts 4 valid unique names', () => {
    const result = validatePlayers(four)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })
  it('accepts exactly 12 players', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => `Player${i + 1}`)
    expect(validatePlayers(twelve).valid).toBe(true)
  })
  it('rejects fewer than 4 players', () => {
    const result = validatePlayers(['Alex', 'Jamie', 'Sam'])
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Add at least 4 players to start.')
  })
  it('rejects more than 12 players', () => {
    const thirteen = Array.from({ length: 13 }, (_, i) => `Player${i + 1}`)
    const result = validatePlayers(thirteen)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('You can have at most 12 players.')
  })
  it('returns trimmed names', () => {
    const result = validatePlayers(['  Alex ', 'Jamie', 'Sam', 'Riley'])
    expect(result.names[0]).toBe('Alex')
  })
  it('rejects duplicates ignoring case and flags every duplicate row', () => {
    const result = validatePlayers(['Alex', 'alex', 'Sam', 'Riley'])
    expect(result.valid).toBe(false)
    expect(result.nameErrors[0]).toBe('Each player must have a different name.')
    expect(result.nameErrors[1]).toBe('Each player must have a different name.')
    expect(result.errors).toContain('Each player must have a different name.')
  })
  it('treats names that differ only by extra spaces as duplicates', () => {
    const result = validatePlayers(['Alex  B', 'alex b', 'Sam', 'Riley'])
    expect(result.valid).toBe(false)
  })
  it('rejects blank and too-short names', () => {
    const result = validatePlayers(['', 'A', 'Sam', 'Riley'])
    expect(result.valid).toBe(false)
    expect(result.nameErrors[0]).toMatch(/at least 2/)
    expect(result.nameErrors[1]).toMatch(/at least 2/)
  })
  it('does not report blank names as duplicates of each other', () => {
    const result = validatePlayers(['', '', 'Sam', 'Riley'])
    expect(result.errors).not.toContain('Each player must have a different name.')
  })
  it('rejects names longer than 16 characters', () => {
    const result = validatePlayers(['A'.repeat(17), 'Jamie', 'Sam', 'Riley'])
    expect(result.valid).toBe(false)
    expect(result.nameErrors[0]).toMatch(/at most 16/)
  })
  it('accepts a name of exactly 16 characters', () => {
    expect(validatePlayers(['A'.repeat(16), 'Jamie', 'Sam', 'Riley']).valid).toBe(true)
  })
  it('handles a non-array input without throwing', () => {
    expect(validatePlayers(undefined).valid).toBe(false)
  })
})

describe('getImpostorRange', () => {
  it('follows floor((players - 1) / 2)', () => {
    expect(getImpostorRange(4)).toEqual({ min: 1, max: 1 })
    expect(getImpostorRange(5)).toEqual({ min: 1, max: 2 })
    expect(getImpostorRange(6)).toEqual({ min: 1, max: 2 })
    expect(getImpostorRange(7)).toEqual({ min: 1, max: 3 })
    expect(getImpostorRange(12)).toEqual({ min: 1, max: 5 })
  })
  it('has no valid range below 4 players', () => {
    expect(getImpostorRange(3).max).toBe(0)
  })
})

describe('validateImpostorCount', () => {
  it('accepts values inside the range', () => {
    expect(validateImpostorCount(1, 4).valid).toBe(true)
    expect(validateImpostorCount(2, 6).valid).toBe(true)
  })
  it('rejects zero and negative', () => {
    expect(validateImpostorCount(0, 6).valid).toBe(false)
    expect(validateImpostorCount(-1, 6).valid).toBe(false)
  })
  it('rejects non-integers and non-numbers', () => {
    expect(validateImpostorCount(1.5, 6).valid).toBe(false)
    expect(validateImpostorCount('2', 6).valid).toBe(false)
    expect(validateImpostorCount(NaN, 6).valid).toBe(false)
  })
  it('rejects too many impostors', () => {
    expect(validateImpostorCount(2, 4).valid).toBe(false)
    expect(validateImpostorCount(3, 6).valid).toBe(false)
  })
  it('uses the specified error message', () => {
    expect(validateImpostorCount(9, 4).error).toBe('Choose a number within the allowed range.')
  })
})

describe('validateSetup', () => {
  it('passes with valid names and impostor count', () => {
    const result = validateSetup(four, 1)
    expect(result.valid).toBe(true)
    expect(result.names).toEqual(four)
  })
  it('fails on bad names before checking impostors', () => {
    expect(validateSetup(['Alex', 'alex', 'Sam', 'Riley'], 1).valid).toBe(false)
  })
  it('fails on a bad impostor count', () => {
    const result = validateSetup(four, 2)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Choose a number within the allowed range.')
  })
})
