import { useEffect, useState } from 'react'

// False at first, true after delayMs. Used to keep a button disabled for a
// moment after a screen appears, so a fast double-tap on the previous button
// cannot trigger this one by accident.
export default function useReadyAfter(delayMs) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])
  return ready
}
