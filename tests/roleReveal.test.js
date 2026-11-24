import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import {
  STEP,
  coverRole,
  createRevealState,
  getRevealView,
  goBackOnePlayer,
  hideAndPass,
  isRevealComplete,
  revealCurrentRole,
} from '../src/game/roleReveal.js'

// A bank with one pair, so the secrets are known and easy to search for.
const bank = [{ id: 'z', word: 'ZEBRA', impostorClue: 'STRIPES', category: 'Wildlife', enabled: true }]
const names = ['Alex', 'Jamie', 'Sam', 'Riley', 'Kai', 'Noor']
const makeGame = (count = 4, impostors = 1) =>
  createGame({ names: names.slice(0, count), impostorCount: impostors, bank }).game

describe('state machine moves', () => {
  it('starts on the first player, on the neutral handoff', () => {
    expect(createRevealState()).toEqual({ index: 0, step: STEP.HANDOFF })
  })
  it('reveals only from the handoff step', () => {
    const revealed = revealCurrentRole(createRevealState())
    expect(revealed.step).toBe(STEP.REVEALED)
    expect(revealCurrentRole(revealed)).toBe(revealed)
  })
  it('cannot hide-and-pass before the role was revealed (no skipping)', () => {
    const start = createRevealState()
    expect(hideAndPass(start, 4)).toBe(start)
  })
  it('moves to the next player on hide-and-pass', () => {
    const state = hideAndPass(revealCurrentRole(createRevealState()), 4)
    expect(state).toEqual({ index: 1, step: STEP.HANDOFF })
  })
  it('finishes after the last player hides their role', () => {
    let state = { index: 3, step: STEP.REVEALED }
    state = hideAndPass(state, 4)
    expect(isRevealComplete(state)).toBe(true)
    expect(state.step).toBe(STEP.DONE)
  })
  it('ignores every move once done', () => {
    const done = { index: 4, step: STEP.DONE }
    expect(revealCurrentRole(done)).toBe(done)
    expect(hideAndPass(done, 4)).toBe(done)
    expect(coverRole(done)).toBe(done)
    expect(goBackOnePlayer(done)).toBe(done)
  })
  it('does not change the state it was given', () => {
    const start = createRevealState()
    revealCurrentRole(start)
    expect(start).toEqual({ index: 0, step: STEP.HANDOFF })
  })
})

describe('privacy cover and going back', () => {
  it('covering clears the secret but stays on the same player', () => {
    const covered = coverRole({ index: 2, step: STEP.REVEALED })
    expect(covered).toEqual({ index: 2, step: STEP.HANDOFF })
  })
  it('covering on a neutral screen changes nothing', () => {
    const state = createRevealState()
    expect(coverRole(state)).toBe(state)
  })
  it('going back returns to the previous player on a neutral screen', () => {
    expect(goBackOnePlayer({ index: 2, step: STEP.HANDOFF })).toEqual({ index: 1, step: STEP.HANDOFF })
  })
  it('cannot go back from the first player, or while a role is showing', () => {
    const first = createRevealState()
    expect(goBackOnePlayer(first)).toBe(first)
    const showing = { index: 2, step: STEP.REVEALED }
    expect(goBackOnePlayer(showing)).toBe(showing)
  })
})

describe('getRevealView: what the screen may render', () => {
  it('handoff view has the name and progress and nothing secret', () => {
    const game = makeGame(6, 2)
    for (let index = 0; index < 6; index++) {
      const view = getRevealView(game, { index, step: STEP.HANDOFF })
      expect(view.kind).toBe('HANDOFF')
      expect(view.playerName).toBe(names[index])
      expect(view.position).toBe(index + 1)
      expect(view.total).toBe(6)
      const text = JSON.stringify(view)
      expect(text).not.toMatch(/ZEBRA|STRIPES|Wildlife|IMPOSTOR|REGULAR|role|word|clue/i)
    }
  })
  it('revealed view shows a regular player only the word', () => {
    const game = makeGame()
    const index = game.players.findIndex((p) => p.role === 'REGULAR')
    const view = getRevealView(game, { index, step: STEP.REVEALED })
    expect(view.display).toEqual({ role: 'REGULAR', word: 'ZEBRA' })
    expect(JSON.stringify(view)).not.toMatch(/STRIPES|Wildlife/)
  })
  it('revealed view shows an impostor only the clue', () => {
    const game = makeGame()
    const index = game.players.findIndex((p) => p.role === 'IMPOSTOR')
    const view = getRevealView(game, { index, step: STEP.REVEALED })
    expect(view.display).toEqual({ role: 'IMPOSTOR', clue: 'STRIPES' })
    expect(JSON.stringify(view)).not.toMatch(/ZEBRA|Wildlife/)
  })
  it('revealed view never mentions any other player', () => {
    const game = makeGame(6, 2)
    const view = getRevealView(game, { index: 0, step: STEP.REVEALED })
    const text = JSON.stringify(view)
    names.slice(1).forEach((other) => expect(text).not.toContain(other))
  })
  it('done view carries nothing', () => {
    expect(getRevealView(makeGame(), { index: 4, step: STEP.DONE })).toEqual({ kind: 'DONE' })
  })
})

describe('a full walk-through', () => {
  it('shows every player exactly one role, in order, then finishes', () => {
    const game = makeGame(6, 2)
    let state = createRevealState()
    const seen = []
    let taps = 0
    while (!isRevealComplete(state) && taps++ < 100) {
      expect(getRevealView(game, state).kind).toBe('HANDOFF')
      state = revealCurrentRole(state)
      const view = getRevealView(game, state)
      expect(view.kind).toBe('REVEALED')
      seen.push(view)
      state = hideAndPass(state, game.players.length)
    }
    expect(seen.map((v) => v.playerName)).toEqual(names)
    expect(seen.filter((v) => v.display.role === 'IMPOSTOR')).toHaveLength(2)
    expect(seen.filter((v) => v.display.role === 'REGULAR').every((v) => v.display.word === 'ZEBRA')).toBe(true)
    expect(seen.filter((v) => v.display.role === 'IMPOSTOR').every((v) => v.display.clue === 'STRIPES')).toBe(true)
  })
  it('after going back, the previous player can reveal again and the walk still finishes', () => {
    const game = makeGame(4, 1)
    let state = createRevealState()
    state = hideAndPass(revealCurrentRole(state), 4) // player 1 done, on player 2
    state = goBackOnePlayer(state) // host returns to player 1's handoff
    expect(getRevealView(game, state).playerName).toBe('Alex')
    for (let i = 0; i < 4; i++) state = hideAndPass(revealCurrentRole(state), 4)
    expect(isRevealComplete(state)).toBe(true)
  })
})
