import { secureRandomInt } from './random.js'

export function getActivePlayers(game) {
  return game.players.filter((player) => !player.isEliminated)
}

// Speaking order for one hint round. Only ACTIVE players speak (eliminated
// players may listen but not give hints, guide 2.3). A random active player
// starts and the rest follow in the order the names were entered, wrapping
// around, like going round a table. randomInt can be replaced in tests.
export function createHintOrder(players, randomInt = secureRandomInt) {
  const active = players.filter((player) => !player.isEliminated)
  if (active.length === 0) return []
  const start = randomInt(active.length)
  return [...active.slice(start), ...active.slice(0, start)].map((player) => player.id)
}

// Everything the hint screen needs, and nothing secret: no word, clue or role.
// status is DONE, SPEAKING or WAITING, shown as text so colour is never the
// only signal.
export function getHintTurnView(game) {
  const names = new Map(game.players.map((player) => [player.id, player.name]))
  const entries = game.hintOrder.map((id, index) => ({
    id,
    name: names.get(id),
    status:
      index < game.currentHintIndex ? 'DONE' : index === game.currentHintIndex ? 'SPEAKING' : 'WAITING',
  }))
  return {
    roundNumber: game.roundNumber,
    speakerId: entries[game.currentHintIndex].id,
    speakerName: entries[game.currentHintIndex].name,
    position: game.currentHintIndex + 1,
    total: entries.length,
    isLast: game.currentHintIndex === entries.length - 1,
    entries,
  }
}
