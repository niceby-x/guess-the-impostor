import { useEffect } from 'react'

// Phones lie about their height. CSS units like 100vh or 100dvh can be TALLER
// than the part of the screen you can actually see (a browser toolbar or the
// gesture bar covers the difference), which pushes bottom buttons off-screen.
//
// So the app asks the browser for the height of the VISIBLE area and sets it as
// the CSS variable --app-height. Every screen is laid out inside exactly that
// height, with the action buttons pinned to its bottom edge.
export default function useAppHeight() {
  useEffect(() => {
    const root = document.documentElement
    const viewport = window.visualViewport

    function update() {
      // visualViewport.height shrinks when the user pinch-zooms; multiplying by
      // the zoom scale gives back the layout height that is really visible.
      const height = viewport ? viewport.height * viewport.scale : window.innerHeight
      root.style.setProperty('--app-height', `${Math.round(height)}px`)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    viewport?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      viewport?.removeEventListener('resize', update)
      root.style.removeProperty('--app-height')
    }
  }, [])
}
