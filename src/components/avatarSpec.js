// Every player is a character: a generated face and colour, chosen by SEAT
// (the order names were entered), never by role. The same seat always gets the
// same face on every screen, so a face can never hint at who the impostor is.

// Twelve colours, one per possible seat.
export const AVATAR_COLORS = [
  '#FF6B6B', // coral
  '#FF9F43', // orange
  '#FFD43B', // yellow
  '#A9E34B', // lime
  '#38D9A9', // mint
  '#3BC9DB', // cyan
  '#4DABF7', // sky
  '#748FFC', // indigo
  '#B197FC', // violet
  '#F783AC', // pink
  '#E599F7', // orchid
  '#D9C5A0', // sand
]

export const HEADS = ['round', 'squircle', 'egg', 'tall', 'wide']
export const EYES = ['dots', 'wide', 'sleepy', 'wink', 'side']
export const MOUTHS = ['smile', 'flat', 'open', 'smirk', 'tongue']
export const EXTRAS = ['none', 'cap', 'glasses', 'beanie', 'mustache', 'headband']

// Seat 0..11 (and beyond, wrapping). The step sizes (1, 2, 3, 1) mean that
// neighbouring seats always differ in head, eyes and mouth as well as colour,
// so colour is never the only thing telling two players apart.
export function getAvatarSpec(seat) {
  const i = ((Math.trunc(seat) % 12) + 12) % 12
  return {
    color: AVATAR_COLORS[i],
    head: HEADS[i % HEADS.length],
    eyes: EYES[(i * 2 + 1) % EYES.length],
    mouth: MOUTHS[(i * 3) % MOUTHS.length],
    extra: EXTRAS[i % EXTRAS.length],
    trim: i % 2 === 0 ? '#15171C' : '#FAFAF7',
  }
}

// Players have ids like "player-3"; their seat is that number minus one.
export function seatOf(playerId) {
  const match = /^player-(\d+)$/.exec(playerId)
  return match ? Number(match[1]) - 1 : 0
}
