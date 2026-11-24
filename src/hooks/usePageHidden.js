import { useEffect } from 'react'

// Calls onHidden whenever the browser tab becomes hidden (Page Visibility API).
// Used to cover a role if the player switches apps while it is on screen.
export default function usePageHidden(onHidden) {
  useEffect(() => {
    function handleChange() {
      if (document.visibilityState === 'hidden') onHidden()
    }
    document.addEventListener('visibilitychange', handleChange)
    return () => document.removeEventListener('visibilitychange', handleChange)
  }, [onHidden])
}
