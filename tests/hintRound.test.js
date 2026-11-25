import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import { createHintOrder, getActivePlayers, getHintTurnView } from '../src/game/hintRound.js'
import { beginHintRound } from '../src/game/phaseTransitions.js'

const bank = [{ id: 'z', word: 'ZEBRA', impostorClue: 'STRIPES', category: 'Wildlife', enabled: true }]
const names = ['Alex', 'Jamie', 'Sam', 'Riley', 'Kai', 'Noor']
const players = names.map((name, i) => ({ id: `player-${i + 1}`, name, isEliminated: false }))
const ids = (list) => list.map((p) => p.id)

describe('createHintOrder', () => {
  it('lists every active player exactly once', () => {
    for (let i = 0; i < 50; i++) {
      const order = createHintOrder(players)
      expect([...order].sort()).toEqual(ids(players).sort())
    }
  })
  it('starts at the chosen player and wraps in the entered order', () => {
    expect(createHintOrder(players, () => 0)).toEqual(ids(players))
    expect(createHintOrder(players, () => 2)).toEqual([
      'player-3', 'player-4', 'player-5', 'player-6', 'player-1', 'player-2',
    ])
  })
  it('skips eliminated players', () => {
    const withOut = players.map((p) => (p.id === 'player-2' ? { ...p, isEliminated: true } : p))
    const order = createHintOrder(withOut, () => 0)
    expect(order).not.toContain('player-2')
    expect(order).toHaveLength(5)
  })
  it('picks the start only among active players', () => {
    const withOut = players.map((p) => (p.id === 'player-1' ? { ...p, isEliminated: true } : p))
    // index 0 of the ACTIVE list is player-2
    expect(createHintOrder(withOut, () => 0)[0]).toBe('player-2')
  })
  it('does not change the players it was given', () => {
    const copy = JSON.stringify(players)
    createHintOrder(players)
    expect(JSON.stringify(players)).toBe(copy)
  })
  it('returns an empty order when nobody is active', () => {
    expect(createHintOrder(players.map((p) => ({ ...p, isEliminated: true })))).toEqual([])
  })
  it('really varies who starts', () => {
    const starters = new Set()
    for (let i = 0; i < 200; i++) starters.add(createHintOrder(players)[0])
    expect(starters.size).toBeGreaterThan(3)
  })
})

describe('getActivePlayers', () => {
  it('excludes eliminated players', () => {
    const game = { players: players.map((p) => (p.id === 'player-3' ? { ...p, isEliminated: true } : p)) }
    expect(getActivePlayers(game)).toHaveLength(5)
  })
})

describe('getHintTurnView', () => {
  const start = () => {
    const { game } = createGame({ names, impostorCount: 2, bank })
    return beginHintRound(game, () => 1) // order: Jamie, Sam, Riley, Kai, Noor, Alex
  }
  it('describes the first turn', () => {
    const view = getHintTurnView(start())
    expect(view.roundNumber).toBe(1)
    expect(view.speakerName).toBe('Jamie')
    expect(view.position).toBe(1)
    expect(view.total).toBe(6)
    expect(view.isLast).toBe(false)
    expect(view.entries.map((e) => e.status)).toEqual(['SPEAKING', 'WAITING', 'WAITING', 'WAITING', 'WAITING', 'WAITING'])
  })
  it('marks earlier speakers as done and later ones as waiting', () => {
    const view = getHintTurnView({ ...start(), currentHintIndex: 2 })
    expect(view.entries.map((e) => e.status)).toEqual(['DONE', 'DONE', 'SPEAKING', 'WAITING', 'WAITING', 'WAITING'])
    expect(view.speakerName).toBe('Riley')
  })
  it('flags the last speaker', () => {
    expect(getHintTurnView({ ...start(), currentHintIndex: 5 }).isLast).toBe(true)
  })
  it('contains no secrets: no word, clue, category or roles', () => {
    const text = JSON.stringify(getHintTurnView(start()))
    expect(text).not.toMatch(/ZEBRA|STRIPES|Wildlife|IMPOSTOR|REGULAR/)
  })
})
