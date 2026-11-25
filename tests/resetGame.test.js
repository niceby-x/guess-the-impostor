import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { DEFAULT_SETTINGS, STARTER_NAMES, createSession, resetGame } from '../src/game/resetGame.js'

const bank = [{ id: 'z', word: 'ZEBRA', impostorClue: 'STRIPES', category: 'Wildlife', enabled: true }]
const names = ['Alex', 'Jamie', 'Sam', 'Riley', 'Kai', 'Noor']
const settings = { impostorCount: 2, hintSeconds: 45, discussionSeconds: 90 }
const midMatch = () => ({
  names,
  settings,
  game: { ...createGame({ names, ...settings, bank }).game, roundNumber: 3, eliminatedIds: ['player-2'], votes: { 'player-1': 'player-3' } },
  lastPairId: null,
})

describe('createSession', () => {
  it('starts with blank names, default settings, no match, no previous pair', () => {
    expect(createSession()).toEqual({
      names: STARTER_NAMES,
      settings: DEFAULT_SETTINGS,
      game: null,
      lastPairId: null,
    })
  })
})

describe('resetGame', () => {
  it('throws away the match completely', () => {
    const next = resetGame(midMatch())
    expect(next.game).toBeNull()
    // Only names, settings and the pair id may remain; no word, clue, role or elimination.
    expect(Object.keys(next).sort()).toEqual(['game', 'lastPairId', 'names', 'settings'])
    expect(JSON.stringify(next)).not.toMatch(/ZEBRA|STRIPES|"role"|"IMPOSTOR"|"REGULAR"|eliminated|player-2|votes/)
  })
  it('keeps names and settings for Play again', () => {
    const next = resetGame(midMatch())
    expect(next.names).toEqual(names)
    expect(next.settings).toEqual(settings)
  })
  it('clears names and settings when asked', () => {
    const next = resetGame(midMatch(), { clearNames: true })
    expect(next.names).toEqual(STARTER_NAMES)
    expect(next.settings).toEqual(DEFAULT_SETTINGS)
    expect(next.game).toBeNull()
  })
  it('remembers only the id of the pair that was in the match', () => {
    const next = resetGame(midMatch())
    expect(next.lastPairId).toBe('z')
    expect(resetGame(midMatch(), { clearNames: true }).lastPairId).toBe('z')
  })
  it('keeps an earlier remembered pair when there is no match to reset', () => {
    const next = resetGame({ names, settings, game: null, lastPairId: 'old' })
    expect(next.lastPairId).toBe('old')
  })
  it('returns copies, so later edits cannot change the old session', () => {
    const session = midMatch()
    const next = resetGame(session)
    next.names.push('Extra')
    next.settings.hintSeconds = 1
    expect(session.names).toHaveLength(6)
    expect(session.settings.hintSeconds).toBe(45)
    const cleared = resetGame(session, { clearNames: true })
    cleared.names.push('X')
    expect(STARTER_NAMES).toEqual(['', '', '', ''])
  })
  it('does not change the session it was given', () => {
    const session = midMatch()
    const copy = JSON.stringify(session)
    resetGame(session)
    resetGame(session, { clearNames: true })
    expect(JSON.stringify(session)).toBe(copy)
  })
})
