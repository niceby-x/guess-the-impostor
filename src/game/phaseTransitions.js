import { checkWinner } from './checkWinner.js'
import { createHintOrder } from './hintRound.js'
import { createVotingState } from './voting.js'

// Named phase changes (guide section 7.3). Each one checks the current phase
// and returns a NEW game object; it never changes the one it was given.

function requirePhase(game, phase, action) {
  if (game.phase !== phase) {
    throw new Error(`Cannot ${action} from phase ${game.phase}.`)
  }
}

// ROLE_REVEAL -> HINTING, once every player has completed the private reveal.
// Creates the speaking order for the first hint round.
export function beginHintRound(game, randomInt) {
  requirePhase(game, 'ROLE_REVEAL', 'begin the hint round')
  return {
    ...game,
    phase: 'HINTING',
    hintOrder: createHintOrder(game.players, randomInt),
    currentHintIndex: 0,
  }
}

// The current speaker is done. Moves to the next speaker, or to DISCUSSION
// after the last one. fromIndex says which turn the caller meant to finish: if
// that turn is already over (for example the timer ran out at the same moment
// as a button tap), nothing changes, so nobody is skipped by accident.
export function advanceHintTurn(game, fromIndex = game.currentHintIndex) {
  requirePhase(game, 'HINTING', 'advance the hint turn')
  if (fromIndex !== game.currentHintIndex) return game
  const isLast = game.currentHintIndex >= game.hintOrder.length - 1
  return isLast
    ? { ...game, phase: 'DISCUSSION' }
    : { ...game, currentHintIndex: game.currentHintIndex + 1 }
}

// DISCUSSION -> VOTING, when the timer ends or the host continues. Sets up the
// first ballot: every active player votes, for any other active player.
export function finishDiscussion(game) {
  requirePhase(game, 'DISCUSSION', 'finish the discussion')
  return { ...game, phase: 'VOTING', votes: {}, voting: createVotingState(game) }
}

// ROUND_RESULT -> GAME_OVER or the next HINTING round (guide section 7.3).
// The winner check decides. For a next round the round number goes up and a
// fresh speaking order is made from the players still in the game.
export function continueFromResult(game, randomInt) {
  requirePhase(game, 'ROUND_RESULT', 'continue from the round result')
  const { winner } = checkWinner(game)
  if (winner) return { ...game, phase: 'GAME_OVER', winner, roundResult: null }
  return {
    ...game,
    phase: 'HINTING',
    roundNumber: game.roundNumber + 1,
    hintOrder: createHintOrder(game.players, randomInt),
    currentHintIndex: 0,
    votes: {},
    voting: null,
    roundResult: null,
  }
}
