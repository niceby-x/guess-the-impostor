import { describe, expect, it } from 'vitest'
import { formatClock, getRemainingSeconds } from '../src/game/timer.js'

describe('getRemainingSeconds', () => {
  it('shows the full time at the start', () => {
    expect(getRemainingSeconds(30_000, 0)).toBe(30)
  })
  it('rounds up, so 0 means time is really up', () => {
    expect(getRemainingSeconds(30_000, 29_001)).toBe(1)
    expect(getRemainingSeconds(30_000, 30_000)).toBe(0)
  })
  it('never goes below 0 after the deadline', () => {
    expect(getRemainingSeconds(30_000, 99_000)).toBe(0)
  })
  it('catches up correctly after a long pause (deadline based)', () => {
    expect(getRemainingSeconds(60_000, 45_000)).toBe(15)
  })
})

describe('formatClock', () => {
  it('formats minutes and padded seconds', () => {
    expect(formatClock(75)).toBe('1:15')
    expect(formatClock(9)).toBe('0:09')
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(120)).toBe('2:00')
  })
  it('handles bad input safely', () => {
    expect(formatClock(-5)).toBe('0:00')
    expect(formatClock(12.9)).toBe('0:12')
  })
})
