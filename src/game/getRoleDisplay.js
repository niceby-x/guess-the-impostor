// What ONE player is allowed to see on the private reveal screen.
// A regular player gets only the word; an impostor gets only the clue.
// Category is never included (guide sections 2.1 and 5.2).
export function getRoleDisplay(player, game) {
  if (player.role === 'IMPOSTOR') {
    return { role: 'IMPOSTOR', clue: game.impostorClue }
  }
  return { role: 'REGULAR', word: game.secretWord }
}
