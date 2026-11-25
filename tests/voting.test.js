import { describe, expect, it } from 'vitest'
import { createGame } from '../src/game/createGame.js'
import {
  advanceHintTurn,
  continueFromResult,
  finishDiscussion,
} from '../src/game/phaseTransitions.js'
import {
  acknowledgeTie,
  getCurrentVoter,
  getVoteTargets,
  submitPrivateVote,
  tallyVotes,
} from '../src/game/voting.js'

const bank = [{ id: 'z', word: 'ZEBRA', impostorClue: 'STRIPES', category: 'Wildlife', enabled: true }]
const NAMES = ['Alex', 'Jamie', 'Sam', 'Riley', 'Kai', 'Noor']
const id = (name) => `player-${NAMES.indexOf(name) + 1}`

// A game at the start of voting, with chosen impostors (so tests are exact).
function votingGame(names = NAMES, impostors = ['Riley']) {
  const { game } = createGame({ names, impostorCount: 1, bank })
  const players = game.players.map((p) => ({ ...p, role: impostors.includes(p.name) ? 'IMPOSTOR' : 'REGULAR' }))
  return finishDiscussion({
    ...game,
    players,
    impostorIds: players.filter((p) => p.role === 'IMPOSTOR').map((p) => p.id),
    phase: 'DISCUSSION',
  })
}

// Casts a whole ballot. ballot = { voterName: targetName }, in voting order.
function castAll(game, ballot) {
  let next = game
  for (const [voter, target] of Object.entries(ballot)) {
    next = submitPrivateVote(next, id(voter), id(target))
  }
  return next
}

describe('tallyVotes', () => {
  const targets = ['a', 'b', 'c']
  it('finds a unique winner', () => {
    const result = tallyVotes({ x: 'a', y: 'a', z: 'b' }, targets)
    expect(result.winnerId).toBe('a')
    expect(result.isTie).toBe(false)
    expect(result.counts).toEqual({ a: 2, b: 1, c: 0 })
    expect(result.totalVotes).toBe(3)
  })
  it('reports a tie for the highest count', () => {
    const result = tallyVotes({ x: 'a', y: 'b', z: 'c', w: 'a', v: 'b' }, targets)
    expect(result.isTie).toBe(true)
    expect(result.winnerId).toBeNull()
    expect(result.leaders).toEqual(['a', 'b'])
  })
  it('handles no votes at all', () => {
    const result = tallyVotes({}, targets)
    expect(result).toMatchObject({ winnerId: null, isTie: false, leaders: [], totalVotes: 0 })
  })
  it('ignores votes for invalid or eliminated targets', () => {
    // "ghost" is not a valid target (for example an eliminated player)
    const result = tallyVotes({ x: 'ghost', y: 'ghost', z: 'b' }, targets)
    expect(result.winnerId).toBe('b')
    expect(result.counts.b).toBe(1)
    expect(result.totalVotes).toBe(1)
  })
  it('ignores self-votes and votes from people who may not vote', () => {
    const result = tallyVotes({ a: 'a', x: 'b', outsider: 'c' }, targets, ['a', 'x'])
    expect(result.counts).toEqual({ a: 0, b: 1, c: 0 })
  })
  it('does not change its input', () => {
    const votes = { x: 'a' }
    tallyVotes(votes, targets)
    expect(votes).toEqual({ x: 'a' })
  })
})

describe('setting up the first ballot', () => {
  it('lets every active player vote, for any active player', () => {
    const game = votingGame()
    expect(game.phase).toBe('VOTING')
    expect(game.voting.stage).toBe('FIRST')
    expect(game.voting.voterIds).toHaveLength(6)
    expect(game.voting.candidateIds).toHaveLength(6)
    expect(game.votes).toEqual({})
    expect(game.voting.tieNoticePending).toBe(false)
  })
  it('passes the phone in the order names were entered', () => {
    expect(getCurrentVoter(votingGame()).name).toBe('Alex')
  })
  it('never offers a voter themselves, and exposes only id and name', () => {
    const targets = getVoteTargets(votingGame(), id('Alex'))
    expect(targets.map((t) => t.name)).toEqual(['Jamie', 'Sam', 'Riley', 'Kai', 'Noor'])
    targets.forEach((t) => expect(Object.keys(t).sort()).toEqual(['id', 'name']))
    expect(JSON.stringify(targets)).not.toMatch(/IMPOSTOR|REGULAR|role/)
  })
})

describe('submitPrivateVote: the rules', () => {
  it('records a vote and moves to the next voter', () => {
    const game = submitPrivateVote(votingGame(), id('Alex'), id('Jamie'))
    expect(game.votes).toEqual({ [id('Alex')]: id('Jamie') })
    expect(getCurrentVoter(game).name).toBe('Jamie')
  })
  it('blocks voting for yourself', () => {
    expect(() => submitPrivateVote(votingGame(), id('Alex'), id('Alex'))).toThrow()
  })
  it('ignores a second vote from the same player; the first one stands', () => {
    const once = submitPrivateVote(votingGame(), id('Alex'), id('Jamie'))
    const twice = submitPrivateVote(once, id('Alex'), id('Sam'))
    expect(twice).toBe(once)
    expect(twice.votes[id('Alex')]).toBe(id('Jamie'))
  })
  it('blocks a vote out of turn', () => {
    expect(() => submitPrivateVote(votingGame(), id('Sam'), id('Alex'))).toThrow()
  })
  it('blocks a vote for someone who is not a valid choice', () => {
    expect(() => submitPrivateVote(votingGame(), id('Alex'), 'player-99')).toThrow()
  })
  it('refuses to run outside the voting phase', () => {
    const game = { ...votingGame(), phase: 'DISCUSSION' }
    expect(() => submitPrivateVote(game, id('Alex'), id('Jamie'))).toThrow()
  })
  it('does not change the game it was given', () => {
    const game = votingGame()
    submitPrivateVote(game, id('Alex'), id('Jamie'))
    expect(game.votes).toEqual({})
    expect(game.voting.currentVoterIndex).toBe(0)
  })
})

describe('a clear winner', () => {
  const ballot = { Alex: 'Riley', Jamie: 'Riley', Sam: 'Riley', Riley: 'Alex', Kai: 'Alex', Noor: 'Riley' }

  it('eliminates the most-voted player and shows the result', () => {
    const game = castAll(votingGame(), ballot)
    expect(game.phase).toBe('ROUND_RESULT')
    expect(game.roundResult.outcome).toBe('ELIMINATED')
    expect(game.roundResult.eliminatedId).toBe(id('Riley'))
    expect(game.roundResult.hadRevote).toBe(false)
    expect(game.eliminatedIds).toEqual([id('Riley')])
    expect(game.players.find((p) => p.name === 'Riley').isEliminated).toBe(true)
  })
  it('reports only totals, never who voted for whom, and clears the ballot', () => {
    const game = castAll(votingGame(), ballot)
    expect(game.roundResult.counts[0]).toEqual({ id: id('Riley'), count: 4 })
    expect(game.votes).toEqual({})
    expect(game.voting).toBeNull()
    expect(JSON.stringify(game.roundResult)).not.toMatch(/voter/i)
  })
})

describe('a tie in the first vote', () => {
  // Riley 2, Kai 2, others 1 each
  const tieBallot = { Alex: 'Riley', Jamie: 'Kai', Sam: 'Riley', Riley: 'Kai', Kai: 'Jamie', Noor: 'Sam' }
  const tied = () => castAll(votingGame(), tieBallot)

  it('starts one revote among only the tied players, after a tie announcement', () => {
    const game = tied()
    expect(game.phase).toBe('VOTING')
    expect(game.voting.stage).toBe('REVOTE')
    expect(game.voting.candidateIds).toEqual([id('Riley'), id('Kai')])
    expect(game.voting.tieNoticePending).toBe(true)
    expect(game.votes).toEqual({})
    expect(game.eliminatedIds).toEqual([])
  })
  it('cannot vote until the tie announcement is acknowledged', () => {
    expect(() => submitPrivateVote(tied(), id('Alex'), id('Riley'))).toThrow()
    const ready = acknowledgeTie(tied())
    expect(ready.voting.tieNoticePending).toBe(false)
    expect(acknowledgeTie(ready)).toBe(ready)
  })
  it('lets all active players vote again, but only for the tied players', () => {
    const game = acknowledgeTie(tied())
    expect(game.voting.voterIds).toHaveLength(6)
    expect(getVoteTargets(game, id('Alex')).map((t) => t.name)).toEqual(['Riley', 'Kai'])
    // a tied player can only choose the other tied player
    expect(getVoteTargets(game, id('Riley')).map((t) => t.name)).toEqual(['Kai'])
    expect(getVoteTargets(game, id('Kai')).map((t) => t.name)).toEqual(['Riley'])
  })
  it('rejects a revote for someone who is not tied', () => {
    expect(() => submitPrivateVote(acknowledgeTie(tied()), id('Alex'), id('Sam'))).toThrow()
  })
  it('the revote can decide it', () => {
    const game = castAll(acknowledgeTie(tied()), {
      Alex: 'Riley', Jamie: 'Kai', Sam: 'Riley', Riley: 'Kai', Kai: 'Riley', Noor: 'Riley',
    })
    expect(game.phase).toBe('ROUND_RESULT')
    expect(game.roundResult.outcome).toBe('ELIMINATED')
    expect(game.roundResult.eliminatedId).toBe(id('Riley'))
    expect(game.roundResult.hadRevote).toBe(true)
  })
  it('a second tie eliminates nobody and does not start another revote', () => {
    const game = castAll(acknowledgeTie(tied()), {
      Alex: 'Riley', Jamie: 'Kai', Sam: 'Riley', Riley: 'Kai', Kai: 'Riley', Noor: 'Kai',
    })
    expect(game.phase).toBe('ROUND_RESULT')
    expect(game.roundResult.outcome).toBe('NO_ELIMINATION')
    expect(game.roundResult.eliminatedId).toBeNull()
    expect(game.roundResult.hadRevote).toBe(true)
    expect(game.eliminatedIds).toEqual([])
    expect(game.players.every((p) => !p.isEliminated)).toBe(true)
  })
  it('a three-way tie revotes among all three', () => {
    const game = castAll(votingGame(), { Alex: 'Jamie', Jamie: 'Sam', Sam: 'Alex', Riley: 'Jamie', Kai: 'Sam', Noor: 'Alex' })
    expect(game.voting.candidateIds).toEqual([id('Alex'), id('Jamie'), id('Sam')])
  })
})

describe('after a round: continuing the match', () => {
  const eliminateRiley = () =>
    castAll(votingGame(), { Alex: 'Riley', Jamie: 'Riley', Sam: 'Riley', Riley: 'Alex', Kai: 'Riley', Noor: 'Riley' })

  it('goes to GAME_OVER when the last impostor is out (regular players win)', () => {
    const over = continueFromResult(eliminateRiley())
    expect(over.phase).toBe('GAME_OVER')
    expect(over.winner).toBe('REGULAR_PLAYERS')
  })
  it('goes to GAME_OVER when impostors reach parity', () => {
    // 3 players: Alex, Jamie (regular) + Sam (impostor). A regular is voted out -> 1 vs 1.
    const game = votingGame(['Alex', 'Jamie', 'Sam', 'Riley'].slice(0, 4), ['Sam', 'Riley'])
    const result = castAll(game, { Alex: 'Jamie', Jamie: 'Alex', Sam: 'Jamie', Riley: 'Jamie' })
    expect(continueFromResult(result).winner).toBe('IMPOSTORS')
  })
  it('starts the next round with a new order of only the players still in', () => {
    const game = votingGame(NAMES, ['Riley', 'Kai']) // 2 impostors, 4 regulars
    const result = castAll(game, { Alex: 'Sam', Jamie: 'Sam', Sam: 'Alex', Riley: 'Sam', Kai: 'Sam', Noor: 'Sam' })
    const next = continueFromResult(result, () => 0)
    expect(next.phase).toBe('HINTING')
    expect(next.roundNumber).toBe(2)
    expect(next.currentHintIndex).toBe(0)
    expect(next.hintOrder).toHaveLength(5)
    expect(next.hintOrder).not.toContain(id('Sam'))
    expect(next.votes).toEqual({})
    expect(next.roundResult).toBeNull()
  })
  it('keeps the same word and clue and the same impostors', () => {
    const game = votingGame(NAMES, ['Riley', 'Kai'])
    const result = castAll(game, { Alex: 'Sam', Jamie: 'Sam', Sam: 'Alex', Riley: 'Sam', Kai: 'Sam', Noor: 'Sam' })
    const next = continueFromResult(result)
    expect(next.secretWord).toBe(game.secretWord)
    expect(next.impostorClue).toBe(game.impostorClue)
    expect(next.impostorIds).toEqual(game.impostorIds)
  })
  it('after a second tie, everyone is still in for the next round', () => {
    const tied = { Alex: 'Riley', Jamie: 'Kai', Sam: 'Riley', Riley: 'Kai', Kai: 'Jamie', Noor: 'Sam' }
    let game = castAll(votingGame(NAMES, ['Riley', 'Kai']), tied)
    game = castAll(acknowledgeTie(game), { Alex: 'Riley', Jamie: 'Kai', Sam: 'Riley', Riley: 'Kai', Kai: 'Riley', Noor: 'Kai' })
    const next = continueFromResult(game)
    expect(next.phase).toBe('HINTING')
    expect(next.hintOrder).toHaveLength(6)
  })
  it('refuses to continue from any other phase', () => {
    expect(() => continueFromResult(votingGame())).toThrow()
  })
  it('does not change the game it was given', () => {
    const game = eliminateRiley()
    continueFromResult(game)
    expect(game.phase).toBe('ROUND_RESULT')
  })

  it('eliminated players are excluded from later hints, discussion and votes', () => {
    const game = votingGame(NAMES, ['Riley', 'Kai'])
    const result = castAll(game, { Alex: 'Sam', Jamie: 'Sam', Sam: 'Alex', Riley: 'Sam', Kai: 'Sam', Noor: 'Sam' })
    let next = continueFromResult(result, () => 0)
    // hints: 5 turns, never Sam
    const spoke = []
    while (next.phase === 'HINTING') {
      spoke.push(next.hintOrder[next.currentHintIndex])
      next = advanceHintTurn(next)
    }
    expect(spoke).toHaveLength(5)
    expect(spoke).not.toContain(id('Sam'))
    // voting: Sam is not a voter and not a target
    next = finishDiscussion(next)
    expect(next.voting.voterIds).not.toContain(id('Sam'))
    expect(next.voting.candidateIds).not.toContain(id('Sam'))
    expect(getVoteTargets(next, id('Alex')).map((t) => t.name)).not.toContain('Sam')
    // and Sam's would-be vote is rejected
    expect(() => submitPrivateVote(next, id('Sam'), id('Alex'))).toThrow()
  })
})

describe('a whole two-round match', () => {
  it('plays round 1 (regular out) then round 2 (impostor out) to a regular win', () => {
    const game = votingGame(['Alex', 'Jamie', 'Sam', 'Riley'], ['Riley'])
    // Round 1: Jamie voted out (a regular). Remaining: Alex, Sam, Riley -> 2 vs 1, continues.
    let state = castAll(game, { Alex: 'Jamie', Jamie: 'Alex', Sam: 'Jamie', Riley: 'Jamie' })
    expect(state.roundResult.eliminatedId).toBe(id('Jamie'))
    state = continueFromResult(state, () => 0)
    expect(state.roundNumber).toBe(2)
    while (state.phase === 'HINTING') state = advanceHintTurn(state)
    state = finishDiscussion(state)
    // Round 2: three voters, Riley is voted out.
    state = castAll(state, { Alex: 'Riley', Sam: 'Riley', Riley: 'Sam' })
    expect(state.roundResult.eliminatedId).toBe(id('Riley'))
    const over = continueFromResult(state)
    expect(over.phase).toBe('GAME_OVER')
    expect(over.winner).toBe('REGULAR_PLAYERS')
  })
})
