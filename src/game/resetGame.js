// Starting over (guide sections 10.3 and 11.1: resetGame, "New game").
//
// A "session" is what the app remembers between matches:
//   { names, settings, game, lastPairId }
// resetGame throws away the match itself (roles, votes, round, word, clue,
// eliminations) and decides what else to keep.

export const STARTER_NAMES = ['', '', '', '']
export const DEFAULT_SETTINGS = { impostorCount: 1, hintSeconds: 30, discussionSeconds: 60 }

export function createSession() {
  return {
    names: [...STARTER_NAMES],
    settings: { ...DEFAULT_SETTINGS },
    game: null,
    lastPairId: null,
  }
}

// Returns a NEW session with no match in it.
//  - clearNames false (Play again, Cancel game): keep the names and settings.
//  - clearNames true (Home, "new game"): back to the empty starting names and
//    default settings.
// Only the previous word pair's ID is remembered, so the next match never
// repeats the same word and clue back to back. The word, clue and roles
// themselves are gone with the match.
export function resetGame(session, { clearNames = false } = {}) {
  const lastPairId = session.game?.wordPairId ?? session.lastPairId ?? null
  return {
    names: clearNames ? [...STARTER_NAMES] : [...session.names],
    settings: clearNames ? { ...DEFAULT_SETTINGS } : { ...session.settings },
    game: null,
    lastPairId,
  }
}
