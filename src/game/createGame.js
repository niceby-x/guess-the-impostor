import { assignRoles } from './assignRoles.js'
import { NO_WORDS_ERROR, selectWordPair, wordBank } from './wordBank.js'
import { validateSetup } from './validateSetup.js'

// Builds a brand-new match (guide section 6.3). Returns
// { ok: true, game } or { ok: false, errors }.
// bank, lastPairId, shuffle and randomInt exist so tests can control them.
export function createGame({
  names,
  impostorCount,
  hintSeconds = 30,
  discussionSeconds = 60,
  bank = wordBank,
  lastPairId = null,
  shuffle,
  randomInt,
}) {
  const setup = validateSetup(names, impostorCount)
  if (!setup.valid) return { ok: false, errors: setup.errors }

  const pair = selectWordPair(bank, lastPairId, randomInt)
  if (!pair) return { ok: false, errors: [NO_WORDS_ERROR] }

  const basePlayers = setup.names.map((name, index) => ({ id: `player-${index + 1}`, name }))
  const players = assignRoles(basePlayers, impostorCount, shuffle)

  return {
    ok: true,
    game: {
      phase: 'ROLE_REVEAL',
      players,
      // The pair stays fixed for the whole match. The category is deliberately
      // NOT copied into the game state.
      wordPairId: pair.id,
      secretWord: pair.word,
      impostorClue: pair.impostorClue,
      impostorIds: players.filter((p) => p.role === 'IMPOSTOR').map((p) => p.id),
      roundNumber: 1,
      hintOrder: [],
      currentHintIndex: 0,
      votes: {},
      voting: null,
      roundResult: null,
      winner: null,
      eliminatedIds: [],
      settings: { hintSeconds, discussionSeconds },
    },
  }
}
