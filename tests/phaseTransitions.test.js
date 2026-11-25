import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { advanceHintTurn, beginHintRound, finishDiscussion } from '../src/game/phaseTransitions.js'

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

describe('beginHintRound: hint order', () => {
  it('creates an order with every player once and starts at turn 0', () => {
    const next = beginHintRound(makeGame())
    expect([...next.hintOrder].sort()).toEqual(['player-1', 'player-2', 'player-3', 'player-4'])
    expect(next.currentHintIndex).toBe(0)
  })
  it('uses the injected random start', () => {
    expect(beginHintRound(makeGame(), () => 2).hintOrder[0]).toBe('player-3')
  })
})

describe('advanceHintTurn', () => {
  const hinting = () => beginHintRound(makeGame(), () => 0)

  it('moves to the next speaker', () => {
    const next = advanceHintTurn(hinting())
    expect(next.currentHintIndex).toBe(1)
    expect(next.phase).toBe('HINTING')
  })
  it('moves to DISCUSSION after the last speaker', () => {
    let game = hinting()
    for (let i = 0; i < 3; i++) game = advanceHintTurn(game)
    expect(game.phase).toBe('HINTING')
    expect(game.currentHintIndex).toBe(3)
    game = advanceHintTurn(game)
    expect(game.phase).toBe('DISCUSSION')
  })
  it('gives every player exactly one turn', () => {
    let game = hinting()
    const spoke = []
    while (game.phase === 'HINTING') {
      spoke.push(game.hintOrder[game.currentHintIndex])
      game = advanceHintTurn(game)
    }
    expect(spoke).toEqual(['player-1', 'player-2', 'player-3', 'player-4'])
  })
  it('ignores a stale call for a turn that is already over (no accidental skip)', () => {
    const afterFirst = advanceHintTurn(hinting(), 0)
    expect(afterFirst.currentHintIndex).toBe(1)
    const again = advanceHintTurn(afterFirst, 0) // timer and button both fired for turn 0
    expect(again).toBe(afterFirst)
  })
  it('refuses to run outside the hint phase', () => {
    expect(() => advanceHintTurn(makeGame())).toThrow()
    expect(() => advanceHintTurn({ ...hinting(), phase: 'DISCUSSION' })).toThrow()
  })
  it('does not change the game it was given', () => {
    const game = hinting()
    advanceHintTurn(game)
    expect(game.currentHintIndex).toBe(0)
  })
})

describe('finishDiscussion', () => {
  it('moves DISCUSSION to VOTING', () => {
    expect(finishDiscussion({ ...makeGame(), phase: 'DISCUSSION' }).phase).toBe('VOTING')
  })
  it('refuses any other phase', () => {
    expect(() => finishDiscussion(makeGame())).toThrow()
    expect(() => finishDiscussion({ ...makeGame(), phase: 'VOTING' })).toThrow()
  })
})
