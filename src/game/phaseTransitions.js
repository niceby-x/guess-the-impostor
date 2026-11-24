// Named phase changes (guide section 7.3). Only the ones built so far.

// ROLE_REVEAL -> HINTING, once every player has completed the private reveal.
export function beginHintRound(game) {
  if (game.phase !== 'ROLE_REVEAL') {
    throw new Error(`Cannot begin the hint round from phase ${game.phase}.`)
  }
  return { ...game, phase: 'HINTING' }
}
