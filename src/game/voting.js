import { getActivePlayers } from './hintRound.js'

// Private voting, ties and elimination (guide sections 7.4, 7.5). All plain
// functions: they return a NEW game and never change the one they are given.
//
// game.voting = {
//   stage: 'FIRST' | 'REVOTE',
//   candidateIds: who may receive votes in this ballot,
//   voterIds: active players, in the order the phone is passed,
//   currentVoterIndex: whose turn it is,
//   tieNoticePending: true right after a tie, until the group taps Start revote,
// }
// game.votes = { voterId: targetId } for the ballot in progress only.

export function createVotingState(game, stage = 'FIRST', candidateIds) {
  const activeIds = getActivePlayers(game).map((player) => player.id)
  return {
    stage,
    candidateIds: candidateIds ?? activeIds,
    voterIds: activeIds,
    currentVoterIndex: 0,
    tieNoticePending: false,
  }
}

export function getCurrentVoter(game) {
  const voting = game.voting
  if (!voting) return null
  const id = voting.voterIds[voting.currentVoterIndex]
  return game.players.find((player) => player.id === id) ?? null
}

// Who this voter may choose: the candidates, minus themselves (no self-votes),
// minus anyone eliminated. Returns { id, name } ONLY, never roles, so the
// voting screen has no secret to leak.
export function getVoteTargets(game, voterId) {
  const activeIds = new Set(getActivePlayers(game).map((player) => player.id))
  return game.voting.candidateIds
    .filter((id) => id !== voterId && activeIds.has(id))
    .map((id) => {
      const player = game.players.find((p) => p.id === id)
      return { id: player.id, name: player.name }
    })
}

// votes: { voterId: targetId }. Only votes for a valid target count. A vote
// for yourself, for someone who is not a valid target (for example an
// eliminated player), or from a non-voter is ignored.
// Returns { counts, totalVotes, highestCount, leaders, winnerId, isTie }.
//   winnerId : the one player with the most votes, or null
//   isTie    : two or more players share the most votes
//   no votes : leaders is empty, winnerId null, isTie false
export function tallyVotes(votes, validTargetIds, validVoterIds = null) {
  const targets = new Set(validTargetIds)
  const voters = validVoterIds ? new Set(validVoterIds) : null
  const counts = Object.fromEntries(validTargetIds.map((id) => [id, 0]))
  let totalVotes = 0
  for (const [voterId, targetId] of Object.entries(votes ?? {})) {
    if (voters && !voters.has(voterId)) continue
    if (!targets.has(targetId) || targetId === voterId) continue
    counts[targetId] += 1
    totalVotes += 1
  }
  const highestCount = Math.max(0, ...Object.values(counts))
  const leaders = highestCount > 0 ? validTargetIds.filter((id) => counts[id] === highestCount) : []
  return {
    counts,
    totalVotes,
    highestCount,
    leaders,
    winnerId: leaders.length === 1 ? leaders[0] : null,
    isTie: leaders.length > 1,
  }
}

// Records the CURRENT voter's vote. Rules:
//  - a second vote from someone who already voted is ignored (first one stands)
//  - self-votes, ineligible targets and out-of-turn votes throw
// After the last vote the ballot resolves by itself (see resolveVotes).
export function submitPrivateVote(game, voterId, targetId) {
  if (game.phase !== 'VOTING') throw new Error(`Cannot vote from phase ${game.phase}.`)
  const voting = game.voting
  if (voting.tieNoticePending) throw new Error('Start the revote before voting.')
  if (!voting.voterIds.includes(voterId)) throw new Error('This player cannot vote.')
  if (Object.hasOwn(game.votes, voterId)) return game // duplicate: first vote stands
  if (voting.voterIds[voting.currentVoterIndex] !== voterId) throw new Error('It is not this player\u2019s turn to vote.')
  if (voterId === targetId) throw new Error('You cannot vote for yourself.')
  if (!getVoteTargets(game, voterId).some((target) => target.id === targetId)) {
    throw new Error('That player is not a valid choice.')
  }

  const votes = { ...game.votes, [voterId]: targetId }
  const nextIndex = voting.currentVoterIndex + 1
  if (nextIndex < voting.voterIds.length) {
    return { ...game, votes, voting: { ...voting, currentVoterIndex: nextIndex } }
  }
  return resolveVotes({ ...game, votes })
}

function sortedCounts(tally, candidateIds) {
  return candidateIds
    .map((id) => ({ id, count: tally.counts[id] }))
    .sort((a, b) => b.count - a.count)
}

// Every active player has voted. One clear winner is eliminated. A tie in the
// FIRST ballot starts ONE revote among the tied players. A tie in the revote
// (or a ballot with no valid votes) eliminates nobody.
export function resolveVotes(game) {
  const voting = game.voting
  const activeIds = new Set(getActivePlayers(game).map((player) => player.id))
  const candidateIds = voting.candidateIds.filter((id) => activeIds.has(id))
  const tally = tallyVotes(game.votes, candidateIds, voting.voterIds)
  const hadRevote = voting.stage === 'REVOTE'

  if (tally.winnerId) {
    return {
      ...game,
      phase: 'ROUND_RESULT',
      players: game.players.map((player) =>
        player.id === tally.winnerId ? { ...player, isEliminated: true } : player,
      ),
      eliminatedIds: [...game.eliminatedIds, tally.winnerId],
      votes: {},
      voting: null,
      roundResult: {
        outcome: 'ELIMINATED',
        eliminatedId: tally.winnerId,
        counts: sortedCounts(tally, candidateIds),
        hadRevote,
      },
    }
  }

  if (tally.isTie && !hadRevote) {
    return {
      ...game,
      votes: {},
      // The group first sees a tie announcement; acknowledgeTie clears this.
      voting: { ...createVotingState(game, 'REVOTE', tally.leaders), tieNoticePending: true },
      roundResult: null,
    }
  }

  return {
    ...game,
    phase: 'ROUND_RESULT',
    votes: {},
    voting: null,
    roundResult: {
      outcome: 'NO_ELIMINATION',
      eliminatedId: null,
      counts: sortedCounts(tally, candidateIds),
      hadRevote,
    },
  }
}

// The group has seen the tie announcement and is ready to start the revote.
export function acknowledgeTie(game) {
  if (game.phase !== 'VOTING') throw new Error(`Cannot start a revote from phase ${game.phase}.`)
  if (!game.voting.tieNoticePending) return game
  return { ...game, voting: { ...game.voting, tieNoticePending: false } }
}
