import { useEffect } from 'react'

// The frame every screen sits in: a top bar, the main stage, and a bottom bar
// for the main action, where a thumb can reach it.
//
// tone is the one rule the whole app teaches:
//   'table'   (green) = everyone may look.
//   'private' (black) = only the person holding the phone looks.
// The page background fades between the two, so the room sees the change.
export default function Screen({ tone = 'table', hud = null, footer = null, footerFlow = false, center = false, children, className = '' }) {
  useEffect(() => {
    document.body.dataset.tone = tone
  }, [tone])

  return (
    <section className={`stage stage--${tone} ${className}`.trim()}>
      {hud && <header className="hud">{hud}</header>}
      <div className={`stage__body${center ? ' stage__body--center' : ''}`}>{children}</div>
      {footer && <footer className={`stage__footer${footerFlow ? ' stage__footer--flow' : ''}`}>{footer}</footer>}
    </section>
  )
}
