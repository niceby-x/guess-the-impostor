import { secureShuffle } from './random.js'
import { validateImpostorCount } from './validateSetup.js'

// players: [{ id, name }]. Shuffles the players, makes the first N of them
// impostors, and returns new player objects in the ORIGINAL order, so the order
// names were entered in never decides who is an impostor (guide section 7.1).
// shuffle can be replaced in tests to make the result predictable.
export function assignRoles(players, impostorCount, shuffle = secureShuffle) {
  const check = validateImpostorCount(impostorCount, players.length)
  if (!check.valid) throw new Error(check.error)

  const impostorIds = new Set(
    shuffle(players)
      .slice(0, impostorCount)
      .map((player) => player.id),
  )

  return players.map((player) => ({
    ...player,
    role: impostorIds.has(player.id) ? 'IMPOSTOR' : 'REGULAR',
    isEliminated: false,
  }))
}
