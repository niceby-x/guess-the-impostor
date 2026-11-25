import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { getFinalReveal } from '../src/game/finalReveal.js'
import { getHintTurnView } from '../src/game/hintRound.js'
import {
  advanceHintTurn,
  beginHintRound,
  continueFromResult,
  finishDiscussion,
} from '../src/game/phaseTransitions.js'
import { createSession, resetGame } from '../src/game/resetGame.js'
import { getRevealView } from '../src/game/roleReveal.js'
import { getVoteTargets, submitPrivateVote } from '../src/game/voting.js'
import { wordBank } from '../src/game/wordBank.js'

const names = ['Alex', 'Jamie', 'Sam', 'Riley', 'Kai', 'Noor']

// Fails if the word or clue shows up in anything a screen is allowed to render
// DURING the match. (The Round result screen shows a role, never the word.)
function assertNoSecretsInPublicViews(game) {
  const secrets = [game.secretWord, game.impostorClue]
  const views = []
  if (game.phase === 'ROLE_REVEAL') {
    game.players.forEach((_, index) => views.push(getRevealView(game, { index, step: 'HANDOFF' })))
  }
  if (game.phase === 'HINTING') views.push(getHintTurnView(game))
  if (game.phase === 'VOTING' && !game.voting.tieNoticePending) {
    game.voting.voterIds.forEach((id) => views.push(getVoteTargets(game, id)))
  }
  if (game.roundResult) views.push(game.roundResult)
  views.forEach((view) => {
    const text = JSON.stringify(view)
    secrets.forEach((secret) => expect(text).not.toContain(secret))
  })
  expect(() => getFinalReveal(game)).toThrow() // never available before the end
}

// Plays a whole match through the engine. Everyone votes for the same target:
// an impostor (so regular players win) or a regular player (so impostors win).
function playToEnd(start, mode) {
  let game = beginHintRound(start, () => 0)
  assertNoSecretsInPublicViews({ ...game, phase: 'ROLE_REVEAL' }) // handoff views exist for reveal
  for (let guard = 0; game.phase !== 'GAME_OVER' && guard < 30; guard++) {
    while (game.phase === 'HINTING') {
      assertNoSecretsInPublicViews(game)
      game = advanceHintTurn(game)
    }
    game = finishDiscussion(game)
    const active = game.players.filter((p) => !p.isEliminated)
    const target = active.find((p) => (mode === 'REGULAR_PLAYERS' ? p.role === 'IMPOSTOR' : p.role === 'REGULAR'))
    for (const voterId of game.voting.voterIds) {
      assertNoSecretsInPublicViews(game)
      const choices = getVoteTargets(game, voterId)
      const pick = voterId === target.id ? choices[0] : choices.find((c) => c.id === target.id)
      game = submitPrivateVote(game, voterId, pick.id)
    }
    assertNoSecretsInPublicViews(game)
    game = continueFromResult(game, () => 0)
  }
  return game
}

const newMatch = (n = names, impostors = 2, lastPairId = null) =>
  createGame({ names: n, impostorCount: impostors, lastPairId }).game

describe('a whole match through the engine', () => {
  it('regular players win by voting out every impostor, with no leaks on the way', () => {
    const over = playToEnd(newMatch(), 'REGULAR_PLAYERS')
    expect(over.phase).toBe('GAME_OVER')
    expect(over.winner).toBe('REGULAR_PLAYERS')
    expect(over.players.filter((p) => p.role === 'IMPOSTOR').every((p) => p.isEliminated)).toBe(true)
  })
  it('impostors win by parity when regular players are voted out', () => {
    const over = playToEnd(newMatch(), 'IMPOSTORS')
    expect(over.winner).toBe('IMPOSTORS')
    const active = over.players.filter((p) => !p.isEliminated)
    const impostors = active.filter((p) => p.role === 'IMPOSTOR').length
    expect(impostors).toBeGreaterThanOrEqual(active.length - impostors)
  })
  it('the final reveal matches the match that was played', () => {
    const start = newMatch()
    const over = playToEnd(start, 'REGULAR_PLAYERS')
    const reveal = getFinalReveal(over)
    expect(reveal.winner).toBe('REGULAR_PLAYERS')
    expect(reveal.secretWord).toBe(start.secretWord)
    expect(reveal.impostorClue).toBe(start.impostorClue)
    expect(reveal.players.map((p) => p.name)).toEqual(names)
    expect(reveal.players.filter((p) => p.role === 'IMPOSTOR').map((p) => p.id)).toEqual(start.impostorIds)
    expect(reveal.roundsPlayed).toBeGreaterThanOrEqual(2)
    expect(JSON.stringify(reveal)).not.toMatch(/category/i)
  })
  it('works for the smallest game (4 players, 1 impostor) for both winners', () => {
    const four = names.slice(0, 4)
    expect(playToEnd(newMatch(four, 1), 'REGULAR_PLAYERS').winner).toBe('REGULAR_PLAYERS')
    expect(playToEnd(newMatch(four, 1), 'IMPOSTORS').winner).toBe('IMPOSTORS')
  })
  it('works for the largest game (12 players, 5 impostors) for both winners', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => `Player${i + 1}`)
    expect(playToEnd(newMatch(twelve, 5), 'REGULAR_PLAYERS').winner).toBe('REGULAR_PLAYERS')
    expect(playToEnd(newMatch(twelve, 5), 'IMPOSTORS').winner).toBe('IMPOSTORS')
  })
})

describe('playing again: nothing old appears in the new match', () => {
  const FRESH_KEYS = ['phase', 'roundNumber', 'currentHintIndex', 'votes', 'voting', 'roundResult', 'winner', 'eliminatedIds']

  it('the new match starts completely clean', () => {
    const over = playToEnd(newMatch(), 'REGULAR_PLAYERS')
    const next = resetGame({ names, settings: { impostorCount: 2, hintSeconds: 30, discussionSeconds: 60 }, game: over, lastPairId: null })
    expect(next.game).toBeNull()
    const second = createGame({ names: next.names, ...next.settings, lastPairId: next.lastPairId }).game
    const pristine = newMatch()
    FRESH_KEYS.forEach((key) => expect(second[key]).toEqual(pristine[key]))
    expect(second.phase).toBe('ROLE_REVEAL')
    expect(second.roundNumber).toBe(1)
    expect(second.players.every((p) => !p.isEliminated)).toBe(true)
    expect(second.hintOrder).toEqual([])
  })
  it('never repeats the previous word pair, across many replays', () => {
    let session = { ...createSession(), names, settings: { impostorCount: 2, hintSeconds: 30, discussionSeconds: 60 } }
    let previousPairId = null
    for (let i = 0; i < 300; i++) {
      const { game } = createGame({ names: session.names, ...session.settings, lastPairId: session.lastPairId })
      if (previousPairId) expect(game.wordPairId).not.toBe(previousPairId)
      previousPairId = game.wordPairId
      session = resetGame({ ...session, game })
    }
  })
  it('keeps avoiding the previous pair after a "new players" reset too', () => {
    const first = newMatch()
    const session = resetGame({ names, settings: {}, game: first, lastPairId: null }, { clearNames: true })
    for (let i = 0; i < 100; i++) {
      const next = createGame({ names, impostorCount: 2, lastPairId: session.lastPairId }).game
      expect(next.wordPairId).not.toBe(first.wordPairId)
    }
  })
  it('gives each new match fresh random roles', () => {
    const impostorSets = new Set()
    for (let i = 0; i < 60; i++) impostorSets.add(newMatch().impostorIds.join(','))
    expect(impostorSets.size).toBeGreaterThan(5)
  })
  it('uses several different word pairs over many matches', () => {
    const pairs = new Set()
    for (let i = 0; i < 100; i++) pairs.add(newMatch().wordPairId)
    expect(pairs.size).toBeGreaterThan(Math.floor(wordBank.length / 2))
  })
  it('a replay picks a different word and keeps the impostor count', () => {
    const over = playToEnd(newMatch(), 'IMPOSTORS')
    const session = resetGame({ names, settings: {}, game: over, lastPairId: null })
    const second = createGame({ names, impostorCount: 2, lastPairId: session.lastPairId }).game
    expect(second.secretWord).not.toBe(over.secretWord)
    expect(second.impostorIds).toHaveLength(2)
  })
})
