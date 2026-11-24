import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { beginHintRound } from '../src/game/phaseTransitions.js'

const makeGame = () => createGame({ names: ['Alex', 'Jamie', 'Sam', 'Riley'], impostorCount: 1 }).game

describe('beginHintRound', () => {
  it('moves ROLE_REVEAL to HINTING and keeps everything else', () => {
    const game = makeGame()
    const next = beginHintRound(game)
    expect(next.phase).toBe('HINTING')
    expect(next.players).toEqual(game.players)
    expect(next.secretWord).toBe(game.secretWord)
  })
  it('does not change the original game object', () => {
    const game = makeGame()
    beginHintRound(game)
    expect(game.phase).toBe('ROLE_REVEAL')
  })
  it('refuses to start from any other phase', () => {
    expect(() => beginHintRound({ ...makeGame(), phase: 'HINTING' })).toThrow()
    expect(() => beginHintRound({ ...makeGame(), phase: 'GAME_OVER' })).toThrow()
  })
})
