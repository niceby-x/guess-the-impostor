import { useEffect, useRef, useState } from 'react'
import { getRemainingSeconds } from '../game/timer.js'

// Counts down from totalSeconds using a fixed DEADLINE and calls onExpire once
// when it reaches zero. Mount a fresh copy (change its key) to restart it.
export default function useCountdown(totalSeconds, onExpire) {
  const [deadline] = useState(() => Date.now() + totalSeconds * 1000)
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    const id = setInterval(() => {
      const left = getRemainingSeconds(deadline, Date.now())
      setRemaining(left)
      if (left === 0) {
        clearInterval(id)
        onExpireRef.current()
      }
    }, 250)
    return () => clearInterval(id)
  }, [deadline])

  return remaining
}
