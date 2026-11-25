import { describe, expect, it } from 'vitest'
import { checkWinner, getTeamCounts } from '../src/game/checkWinner.js'

const player = (id, role, isEliminated = false) => ({ id, name: id, role, isEliminated })
const game = (...players) => ({ players })
const R = (id, out) => player(id, 'REGULAR', out)
const I = (id, out) => player(id, 'IMPOSTOR', out)

describe('getTeamCounts', () => {
  it('counts only active players', () => {
    const counts = getTeamCounts(game(R('a'), R('b', true), R('c'), I('d'), I('e', true)))
    expect(counts).toEqual({ impostors: 1, regulars: 2 })
  })
})

describe('checkWinner', () => {
  it('regular players win when no impostor is left', () => {
    expect(checkWinner(game(R('a'), R('b'), R('c'), I('d', true))).winner).toBe('REGULAR_PLAYERS')
  })
  it('impostors win when they equal the regular players', () => {
    expect(checkWinner(game(R('a'), I('b'))).winner).toBe('IMPOSTORS')
    expect(checkWinner(game(R('a'), R('b'), I('c'), I('d'))).winner).toBe('IMPOSTORS')
  })
  it('impostors win when they outnumber the regular players', () => {
    expect(checkWinner(game(R('a'), I('b'), I('c'))).winner).toBe('IMPOSTORS')
  })
  it('the match continues while regular players outnumber impostors', () => {
    expect(checkWinner(game(R('a'), R('b'), I('c'))).winner).toBeNull()
    expect(checkWinner(game(R('a'), R('b'), R('c'), I('d'))).winner).toBeNull()
  })
  it('ignores eliminated players of both teams', () => {
    // 3 regulars out, 1 regular + 1 impostor left -> impostors win
    expect(checkWinner(game(R('a'), R('b', true), R('c', true), I('d'))).winner).toBe('IMPOSTORS')
  })
  it('reports the counts it used', () => {
    expect(checkWinner(game(R('a'), R('b'), I('c')))).toEqual({ winner: null, impostors: 1, regulars: 2 })
  })
})
