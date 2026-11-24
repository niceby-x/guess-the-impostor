import { getRoleDisplay } from './getRoleDisplay.js'

// The private role reveal as a tiny state machine (guide sections 3.1, 7.2).
//   HANDOFF  : neutral "Pass the phone to <name>" screen, nothing secret.
//   REVEALED : that one player is looking at their own role.
//   DONE     : every player has seen their role.
// Every function returns a NEW state and never changes the one it was given.
// A move that is not allowed (e.g. hiding a role that was never revealed)
// returns the same state, so a stray tap cannot skip anybody.

export const STEP = { HANDOFF: 'HANDOFF', REVEALED: 'REVEALED', DONE: 'DONE' }

export function createRevealState() {
  return { index: 0, step: STEP.HANDOFF }
}

// Player taps "Reveal my role".
export function revealCurrentRole(state) {
  return state.step === STEP.HANDOFF ? { ...state, step: STEP.REVEALED } : state
}

// Player taps "Hide and pass". Only works after a reveal, so nobody can be
// passed over without having seen their role.
export function hideAndPass(state, playerCount) {
  if (state.step !== STEP.REVEALED) return state
  const next = state.index + 1
  return next >= playerCount
    ? { index: playerCount, step: STEP.DONE }
    : { index: next, step: STEP.HANDOFF }
}

// Privacy cover: the tab was hidden while a role was showing. Clear the secret
// and go back to the neutral screen for the SAME player.
export function coverRole(state) {
  return state.step === STEP.REVEALED ? { ...state, step: STEP.HANDOFF } : state
}

// Host returns to the previous player's neutral handoff screen.
export function goBackOnePlayer(state) {
  return state.step === STEP.HANDOFF && state.index > 0
    ? { index: state.index - 1, step: STEP.HANDOFF }
    : state
}

export function isRevealComplete(state) {
  return state.step === STEP.DONE
}

// The ONLY data the reveal screens may render. A handoff view carries a name
// and progress and nothing secret; a revealed view carries just that one
// player's display object (word OR clue). No category, no other players.
export function getRevealView(game, state) {
  if (state.step === STEP.DONE) return { kind: 'DONE' }
  const player = game.players[state.index]
  if (state.step === STEP.HANDOFF) {
    return {
      kind: 'HANDOFF',
      playerName: player.name,
      position: state.index + 1,
      total: game.players.length,
      canGoBack: state.index > 0,
    }
  }
  return {
    kind: 'REVEALED',
    playerName: player.name,
    display: getRoleDisplay(player, game),
  }
}
