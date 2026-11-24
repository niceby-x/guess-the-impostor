import wordPairs from './wordPairs.json'
import { secureRandomInt } from './random.js'

export const wordBank = wordPairs

export const NO_WORDS_ERROR = 'The word bank is empty or invalid; load valid word data.'

function isFilled(value) {
  return typeof value === 'string' && value.trim().length > 0
}

// A pair can be used in a match when it is enabled, complete, and the clue is
// not simply the word again. Category is optional internal metadata.
export function isUsablePair(pair) {
  return (
    typeof pair === 'object' &&
    pair !== null &&
    pair.enabled === true &&
    isFilled(pair.id) &&
    isFilled(pair.word) &&
    isFilled(pair.impostorClue) &&
    pair.word.trim().toLowerCase() !== pair.impostorClue.trim().toLowerCase()
  )
}

// Checks the data file itself. Used by tests so a bad edit to wordPairs.json
// is caught before it reaches a game. Returns { valid, errors }.
export function validateWordBank(bank) {
  const errors = []
  if (!Array.isArray(bank) || bank.length === 0) {
    return { valid: false, errors: ['The word bank is empty.'] }
  }
  const ids = new Set()
  bank.forEach((pair, index) => {
    const label = pair?.id ? `Pair ${pair.id}` : `Pair at position ${index + 1}`
    if (typeof pair !== 'object' || pair === null) {
      errors.push(`${label} is not an object.`)
      return
    }
    if (!isFilled(pair.id)) errors.push(`${label} has no id.`)
    else if (ids.has(pair.id)) errors.push(`${label} has a duplicate id.`)
    else ids.add(pair.id)
    if (!isFilled(pair.word)) errors.push(`${label} has no word.`)
    if (!isFilled(pair.impostorClue)) errors.push(`${label} has no impostor clue.`)
    if (typeof pair.enabled !== 'boolean') errors.push(`${label} needs enabled true or false.`)
    if (isFilled(pair.word) && isFilled(pair.impostorClue)) {
      const word = pair.word.trim().toLowerCase()
      const clue = pair.impostorClue.trim().toLowerCase()
      if (clue === word) errors.push(`${label}: the clue must not be the word itself.`)
      else if (clue.includes(word)) errors.push(`${label}: the clue must not contain the word.`)
    }
  })
  return { valid: errors.length === 0, errors }
}

// Picks one usable pair at random. When at least two pairs are usable, the pair
// used in the previous match (lastPairId) is skipped. Returns null if none.
export function selectWordPair(bank = wordBank, lastPairId = null, randomInt = secureRandomInt) {
  const usable = Array.isArray(bank) ? bank.filter(isUsablePair) : []
  if (usable.length === 0) return null
  const candidates =
    usable.length >= 2 && lastPairId ? usable.filter((pair) => pair.id !== lastPairId) : usable
  return candidates[randomInt(candidates.length)]
}
