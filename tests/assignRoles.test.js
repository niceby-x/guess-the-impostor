import { describe, expect, it } from 'vitest'
import { assignRoles } from '../src/game/assignRoles.js'
import { getRoleDisplay } from '../src/game/getRoleDisplay.js'

const makePlayers = (n) => Array.from({ length: n }, (_, i) => ({ id: `player-${i + 1}`, name: `P${i + 1}` }))
const countRole = (players, role) => players.filter((p) => p.role === role).length

describe('assignRoles', () => {
  it('assigns the exact impostor count', () => {
    for (const [players, impostors] of [[4, 1], [6, 2], [7, 3], [12, 5]]) {
      const result = assignRoles(makePlayers(players), impostors)
      expect(countRole(result, 'IMPOSTOR')).toBe(impostors)
      expect(countRole(result, 'REGULAR')).toBe(players - impostors)
    }
  })
  it('keeps every player once, in the original order, with all fields', () => {
    const input = makePlayers(6)
    const result = assignRoles(input, 2)
    expect(result.map((p) => p.id)).toEqual(input.map((p) => p.id))
    expect(result.map((p) => p.name)).toEqual(input.map((p) => p.name))
    expect(result.every((p) => p.isEliminated === false)).toBe(true)
    expect(result.every((p) => p.role === 'REGULAR' || p.role === 'IMPOSTOR')).toBe(true)
  })
  it('does not change the input players', () => {
    const input = makePlayers(4)
    assignRoles(input, 1)
    expect(input[0]).toEqual({ id: 'player-1', name: 'P1' })
  })
  it('takes impostors from the front of the shuffled list', () => {
    const reverse = (items) => [...items].reverse()
    const result = assignRoles(makePlayers(5), 2, reverse)
    expect(result.filter((p) => p.role === 'IMPOSTOR').map((p) => p.id)).toEqual(['player-4', 'player-5'])
  })
  it('rejects impossible impostor counts', () => {
    expect(() => assignRoles(makePlayers(4), 2)).toThrow()
    expect(() => assignRoles(makePlayers(6), 0)).toThrow()
    expect(() => assignRoles(makePlayers(6), 1.5)).toThrow()
    expect(() => assignRoles(makePlayers(3), 1)).toThrow()
  })
  it('is fair: every seat becomes the impostor about equally often', () => {
    // 6 players, 1 impostor, 6000 games: each seat expects about 1000 (sd is
    // roughly 29), so a +/-200 window is ~7 standard deviations wide.
    const counts = Array(6).fill(0)
    for (let i = 0; i < 6000; i++) {
      assignRoles(makePlayers(6), 1).forEach((p, index) => {
        if (p.role === 'IMPOSTOR') counts[index]++
      })
    }
    counts.forEach((count) => {
      expect(count).toBeGreaterThan(800)
      expect(count).toBeLessThan(1200)
    })
  })
})

describe('getRoleDisplay', () => {
  const game = { secretWord: 'DOG', impostorClue: 'BARKS', category: 'Animals' }

  it('gives a regular player only the word', () => {
    expect(getRoleDisplay({ role: 'REGULAR' }, game)).toEqual({ role: 'REGULAR', word: 'DOG' })
  })
  it('gives an impostor only the clue', () => {
    expect(getRoleDisplay({ role: 'IMPOSTOR' }, game)).toEqual({ role: 'IMPOSTOR', clue: 'BARKS' })
  })
  it('never includes the category, the other secret, or other players', () => {
    const regular = JSON.stringify(getRoleDisplay({ role: 'REGULAR' }, game))
    const impostor = JSON.stringify(getRoleDisplay({ role: 'IMPOSTOR' }, game))
    expect(regular).not.toMatch(/Animals|BARKS/)
    expect(impostor).not.toMatch(/Animals|DOG/)
  })
})
