// Secure randomness using the browser's Web Crypto API (guide section 7.1).

// Returns a whole number from 0 up to (but not including) maxExclusive.
// Uses rejection sampling so every value is equally likely (no modulo bias).
export function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 0x100000000) {
    throw new Error('secureRandomInt needs a whole number from 1 to 2^32.')
  }
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
  const buffer = new Uint32Array(1)
  do {
    globalThis.crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return buffer[0] % maxExclusive
}

// Fisher-Yates shuffle. Returns a NEW array; the input is never changed.
// randomInt can be replaced in tests to make the shuffle predictable.
export function secureShuffle(items, randomInt = secureRandomInt) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
