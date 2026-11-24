import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { getRoleDisplay } from '../src/game/getRoleDisplay.js'
import { NO_WORDS_ERROR, wordBank } from '../src/game/wordBank.js'

const names = ['Alex', 'Jamie', 'Sam', 'Riley', 'Kai', 'Noor']

describe('createGame', () => {
  it('builds a valid starting game state', () => {
    const result = createGame({ names, impostorCount: 2 })
    expect(result.ok).toBe(true)
    const { game } = result
    expect(game.phase).toBe('ROLE_REVEAL')
    expect(game.players).toHaveLength(6)
    expect(game.impostorIds).toHaveLength(2)
    expect(game.roundNumber).toBe(1)
    expect(game.votes).toEqual({})
    expect(game.eliminatedIds).toEqual([])
    expect(game.settings).toEqual({ hintSeconds: 30, discussionSeconds: 60 })
  })
  it('uses a real pair from the bank, kept consistent', () => {
    const { game } = createGame({ names, impostorCount: 1 })
    const pair = wordBank.find((p) => p.id === game.wordPairId)
    expect(game.secretWord).toBe(pair.word)
    expect(game.impostorClue).toBe(pair.impostorClue)
  })
  it('gives each player exactly the right private information', () => {
    const { game } = createGame({ names, impostorCount: 2 })
    game.players.forEach((player) => {
      const display = getRoleDisplay(player, game)
      if (player.role === 'IMPOSTOR') {
        expect(display).toEqual({ role: 'IMPOSTOR', clue: game.impostorClue })
        expect(game.impostorIds).toContain(player.id)
      } else {
        expect(display).toEqual({ role: 'REGULAR', word: game.secretWord })
        expect(game.impostorIds).not.toContain(player.id)
      }
    })
  })
  it('never puts the category in the game state', () => {
    const { game } = createGame({ names, impostorCount: 1 })
    expect(game).not.toHaveProperty('category')
    const text = JSON.stringify(game)
    wordBank.forEach((p) => expect(text).not.toContain(p.category))
  })
  it('uses cleaned names and sequential ids', () => {
    const { game } = createGame({ names: ['  Alex ', 'Jamie', 'Sam', 'Riley'], impostorCount: 1 })
    expect(game.players.map((p) => p.name)).toEqual(['Alex', 'Jamie', 'Sam', 'Riley'])
    expect(game.players.map((p) => p.id)).toEqual(['player-1', 'player-2', 'player-3', 'player-4'])
  })
  it('passes timer settings through', () => {
    const { game } = createGame({ names, impostorCount: 1, hintSeconds: 45, discussionSeconds: 90 })
    expect(game.settings).toEqual({ hintSeconds: 45, discussionSeconds: 90 })
  })
  it('does not reuse the previous pair', () => {
    for (let i = 0; i < 100; i++) {
      expect(createGame({ names, impostorCount: 1, lastPairId: 'word-001' }).game.wordPairId).not.toBe('word-001')
    }
  })
  it('fails with a clear message when no word pairs are usable', () => {
    expect(createGame({ names, impostorCount: 1, bank: [] })).toEqual({ ok: false, errors: [NO_WORDS_ERROR] })
  })
  it('fails on invalid setup without picking words', () => {
    expect(createGame({ names: ['Alex', 'alex', 'Sam', 'Riley'], impostorCount: 1 }).ok).toBe(false)
    expect(createGame({ names, impostorCount: 5 }).errors).toContain('Choose a number within the allowed range.')
    expect(createGame({ names: ['A', 'B'], impostorCount: 1 }).ok).toBe(false)
  })
  it('starts a clean game each time (no leftovers)', () => {
    const first = createGame({ names, impostorCount: 1 }).game
    const second = createGame({ names, impostorCount: 1 }).game
    expect(second).not.toBe(first)
    expect(second.votes).toEqual({})
    expect(second.eliminatedIds).toEqual([])
  })
})
