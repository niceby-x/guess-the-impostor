import { describe, expect, it } from 'vitest'
import { AVATAR_COLORS, getAvatarSpec, seatOf } from '../src/components/avatarSpec.js'

const seats = Array.from({ length: 12 }, (_, i) => i)

describe('getAvatarSpec', () => {
  it('gives each of the 12 seats its own colour', () => {
    expect(new Set(seats.map((s) => getAvatarSpec(s).color)).size).toBe(12)
    expect(AVATAR_COLORS).toHaveLength(12)
  })
  it('gives every seat a different full look', () => {
    const looks = seats.map((s) => JSON.stringify(getAvatarSpec(s)))
    expect(new Set(looks).size).toBe(12)
  })
  it('makes neighbouring seats differ in head, eyes and mouth, not just colour', () => {
    for (let s = 0; s < 11; s++) {
      const a = getAvatarSpec(s)
      const b = getAvatarSpec(s + 1)
      expect(a.head).not.toBe(b.head)
      expect(a.eyes).not.toBe(b.eyes)
      expect(a.mouth).not.toBe(b.mouth)
    }
  })
  it('is stable: the same seat always gets the same face', () => {
    expect(getAvatarSpec(5)).toEqual(getAvatarSpec(5))
  })
  it('wraps safely for odd input', () => {
    expect(getAvatarSpec(12)).toEqual(getAvatarSpec(0))
    expect(getAvatarSpec(-1)).toEqual(getAvatarSpec(11))
    expect(() => getAvatarSpec(2.7)).not.toThrow()
  })
  it('carries no role information', () => {
    const text = JSON.stringify(seats.map(getAvatarSpec))
    expect(text).not.toMatch(/impostor|regular|role|mask/i)
  })
})

describe('seatOf', () => {
  it('turns a player id into a zero-based seat', () => {
    expect(seatOf('player-1')).toBe(0)
    expect(seatOf('player-12')).toBe(11)
  })
  it('falls back to seat 0 for an unexpected id', () => {
    expect(seatOf('nope')).toBe(0)
  })
})
