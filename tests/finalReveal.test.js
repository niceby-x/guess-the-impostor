import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { getFinalReveal } from '../src/game/finalReveal.js'

const bank = [{ id: 'z', word: 'ZEBRA', impostorClue: 'STRIPES', category: 'Wildlife', enabled: true }]
const names = ['Alex', 'Jamie', 'Sam', 'Riley']
const makeGame = (phase, extra = {}) => ({
  ...createGame({ names, impostorCount: 1, bank }).game,
  phase,
  ...extra,
})

describe('getFinalReveal', () => {
  const over = () => makeGame('GAME_OVER', { winner: 'REGULAR_PLAYERS', roundNumber: 3 })

  it('returns the winner, word, clue and rounds played', () => {
    const reveal = getFinalReveal(over())
    expect(reveal.winner).toBe('REGULAR_PLAYERS')
    expect(reveal.secretWord).toBe('ZEBRA')
    expect(reveal.impostorClue).toBe('STRIPES')
    expect(reveal.roundsPlayed).toBe(3)
  })
  it('lists every player once, in entered order, with role and status', () => {
    const reveal = getFinalReveal(over())
    expect(reveal.players.map((p) => p.name)).toEqual(names)
    reveal.players.forEach((p) => {
      expect(['REGULAR', 'IMPOSTOR']).toContain(p.role)
      expect(typeof p.isEliminated).toBe('boolean')
    })
    expect(reveal.players.filter((p) => p.role === 'IMPOSTOR')).toHaveLength(1)
  })
  it('never includes the category', () => {
    const text = JSON.stringify(getFinalReveal(over()))
    expect(text).not.toContain('Wildlife')
    expect(text).not.toMatch(/category/i)
  })
  it('refuses to reveal anything before the match is over', () => {
    for (const phase of ['ROLE_REVEAL', 'HINTING', 'DISCUSSION', 'VOTING', 'ROUND_RESULT']) {
      expect(() => getFinalReveal(makeGame(phase))).toThrow()
    }
  })
  it('does not change the game it was given', () => {
    const game = over()
    const copy = JSON.stringify(game)
    getFinalReveal(game)
    expect(JSON.stringify(game)).toBe(copy)
  })
})
