// Milestone 2: setup rules in plain JavaScript (no React), so they are easy
// to test now and can be reused by the online mode later.

export const MIN_PLAYERS = 4
export const MAX_PLAYERS = 12
export const MIN_NAME_LENGTH = 2
export const MAX_NAME_LENGTH = 16

// Trim the ends and collapse inner runs of spaces: "  Alex   B " -> "Alex B"
export function cleanName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ')
}

// Allowed impostor range for a player count: 1 to floor((players - 1) / 2).
// Below the minimum player count there is no valid range, so max is 0.
export function getImpostorRange(playerCount) {
  if (!Number.isInteger(playerCount) || playerCount < MIN_PLAYERS) {
    return { min: 1, max: 0 }
  }
  return { min: 1, max: Math.floor((playerCount - 1) / 2) }
}

// names: array of raw strings from the setup screen.
// Returns { valid, names (cleaned), errors (general messages),
//           nameErrors (message per index, only for rows with a problem) }
export function validatePlayers(names) {
  const raw = Array.isArray(names) ? names : []
  const cleaned = raw.map(cleanName)
  const errors = []
  const nameErrors = {}

  if (cleaned.length < MIN_PLAYERS) {
    errors.push(`Add at least ${MIN_PLAYERS} players to start.`)
  } else if (cleaned.length > MAX_PLAYERS) {
    errors.push(`You can have at most ${MAX_PLAYERS} players.`)
  }

  cleaned.forEach((name, index) => {
    if (name.length < MIN_NAME_LENGTH) {
      nameErrors[index] = `Name must be at least ${MIN_NAME_LENGTH} characters.`
    } else if (name.length > MAX_NAME_LENGTH) {
      nameErrors[index] = `Name must be at most ${MAX_NAME_LENGTH} characters.`
    }
  })

  // Duplicates, ignoring letter case. Every row sharing a name is flagged.
  const seen = new Map() // lowercase name -> indexes using it
  cleaned.forEach((name, index) => {
    if (name.length === 0) return
    const key = name.toLowerCase()
    seen.set(key, [...(seen.get(key) ?? []), index])
  })
  let hasDuplicates = false
  for (const indexes of seen.values()) {
    if (indexes.length > 1) {
      hasDuplicates = true
      indexes.forEach((i) => {
        nameErrors[i] = 'Each player must have a different name.'
      })
    }
  }
  if (hasDuplicates) errors.push('Each player must have a different name.')

  const valid = errors.length === 0 && Object.keys(nameErrors).length === 0
  return { valid, names: cleaned, errors, nameErrors }
}

// Returns { valid, error }. Must be a whole number inside the allowed range.
export function validateImpostorCount(impostorCount, playerCount) {
  const { min, max } = getImpostorRange(playerCount)
  const ok =
    typeof impostorCount === 'number' &&
    Number.isInteger(impostorCount) &&
    impostorCount >= min &&
    impostorCount <= max
  return ok
    ? { valid: true, error: null }
    : { valid: false, error: 'Choose a number within the allowed range.' }
}

// Full check used right before a game starts: players first, then impostors.
export function validateSetup(names, impostorCount) {
  const players = validatePlayers(names)
  if (!players.valid) {
    return { valid: false, names: players.names, errors: players.errors, nameErrors: players.nameErrors }
  }
  const impostors = validateImpostorCount(impostorCount, players.names.length)
  return {
    valid: impostors.valid,
    names: players.names,
    errors: impostors.valid ? [] : [impostors.error],
    nameErrors: {},
  }
}
