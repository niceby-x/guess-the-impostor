// Everything the Game over screen may show (guide section 4, Game over row):
// the winning team, every player's role, the secret word and the impostor
// clue. The category is internal metadata and is never included.
//
// It THROWS unless the match is really over, so a bug elsewhere can never show
// every role while the game is still being played.
export function getFinalReveal(game) {
  if (game.phase !== 'GAME_OVER') {
    throw new Error(`The final reveal is only available at GAME_OVER, not ${game.phase}.`)
  }
  return {
    winner: game.winner,
    secretWord: game.secretWord,
    impostorClue: game.impostorClue,
    roundsPlayed: game.roundNumber,
    players: game.players.map((player) => ({
      id: player.id,
      name: player.name,
      role: player.role,
      isEliminated: player.isEliminated,
    })),
  }
}
