// Countdown maths for the hint and discussion timers. The timer is based on a
// DEADLINE (a fixed clock time), not on counting ticks, so it stays correct
// even if the browser slows the page down in the background (guide 9.1).

// Whole seconds left until deadlineMs, never below 0. Rounds UP, so a timer
// started at 30 shows 30 first and shows 0 only when time is really up.
export function getRemainingSeconds(deadlineMs, nowMs) {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000))
}

// 75 -> "1:15", 9 -> "0:09"
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
