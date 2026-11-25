// Win conditions (guide section 7.5). Only ACTIVE (not eliminated) players count.

export function getTeamCounts(game) {
  const active = game.players.filter((player) => !player.isEliminated)
  const impostors = active.filter((player) => player.role === 'IMPOSTOR').length
  return { impostors, regulars: active.length - impostors }
}

// Returns { winner, impostors, regulars }, where winner is:
//   'REGULAR_PLAYERS' when no impostor is left,
//   'IMPOSTORS' when impostors are at least as many as regular players,
//   null when the match goes on.
export function checkWinner(game) {
  const { impostors, regulars } = getTeamCounts(game)
  let winner = null
  if (impostors === 0) winner = 'REGULAR_PLAYERS'
  else if (impostors >= regulars) winner = 'IMPOSTORS'
  return { winner, impostors, regulars }
}
