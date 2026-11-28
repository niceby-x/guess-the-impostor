import { useEffect, useRef, useState } from 'react'

// The frame every screen sits in: a top bar, a scrolling stage, and a bottom bar
// for the main action, where a thumb can reach it.
//
// The frame is exactly as tall as the VISIBLE screen (--app-height, see
// useAppHeight). Only the middle scrolls, so the buttons are always on screen.
//
// tone is the one rule the whole app teaches:
//   'table'   (green) = everyone may look.
//   'private' (black) = only the person holding the phone looks.
// The page background fades between the two, so the room sees the change.
//
// footerFlow puts the buttons at the end of the scrolling content instead of
// pinning them (used by the long Game over screen).
export default function Screen({
  tone = 'table',
  hud = null,
  footer = null,
  footerFlow = false,
  center = false,
  children,
  className = '',
}) {
  useEffect(() => {
    document.body.dataset.tone = tone
  }, [tone])

  const centered = center || tone === 'private'

  // When the middle of the screen overflows it scrolls, and a keyboard user must
  // be able to reach it. So it becomes focusable only while it actually
  // overflows; ordinary screens get no extra Tab stop.
  const scrollRef = useRef(null)
  const [scrollable, setScrollable] = useState(false)
  useEffect(() => {
    const area = scrollRef.current
    if (!area) return undefined
    const check = () => setScrollable(area.scrollHeight > area.clientHeight + 1)
    check()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(check)
    observer.observe(area)
    if (area.firstElementChild) observer.observe(area.firstElementChild)
    return () => observer.disconnect()
  })

  return (
    <section className={`stage stage--${tone} ${className}`.trim()}>
      {hud && <header className="hud">{hud}</header>}
      <div
        className="stage__scroll"
        ref={scrollRef}
        tabIndex={scrollable ? 0 : undefined}
        role={scrollable ? 'region' : undefined}
        aria-label={scrollable ? 'Scrollable screen content' : undefined}
      >
        <div className="stage__body">
          <div className={`stage__content${centered ? ' stage__content--center' : ''}`}>{children}</div>
          {footer && footerFlow && <footer className="stage__footer stage__footer--flow">{footer}</footer>}
        </div>
      </div>
      {footer && !footerFlow && <footer className="stage__footer">{footer}</footer>}
    </section>
  )
}
