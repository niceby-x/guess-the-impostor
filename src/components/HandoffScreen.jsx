import { useEffect, useRef, useState } from 'react'
import useReadyAfter from '../hooks/useReadyAfter.js'

// The Reveal button stays disabled for a moment after this screen appears, so a
// fast double-tap on "Hide and pass" cannot reveal the NEXT player's role to
// the player who just finished.
const READY_DELAY_MS = 600

// Neutral screen: it receives a name and progress and NOTHING else, so it has
// no way to show a word, clue or role (guide sections 3.1 and 4.1).
export default function HandoffScreen({
  playerName,
  position,
  total,
  canGoBack,
  onReveal,
  onGoBack,
  onQuit,
}) {
  const ready = useReadyAfter(READY_DELAY_MS)
  const [confirming, setConfirming] = useState(null) // null | 'BACK' | 'QUIT'
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="screen screen--center handoff">
      <span className="status-chip">Role hidden</span>
      <p className="subtle">
        Player {position} of {total}
      </p>
      <p className="handoff__lead">Pass the phone to</p>
      <h2 className="handoff__name focus-target" tabIndex={-1} ref={headingRef}>
        {playerName}
      </h2>
      <p className="subtle">Make sure nobody else is looking at the screen.</p>

      <button className="btn btn--primary" onClick={onReveal} disabled={!ready}>
        Reveal my role
      </button>

      {confirming === null && (
        <div className="handoff__extras">
          {canGoBack && (
            <button className="link-small" onClick={() => setConfirming('BACK')}>
              Go back one player
            </button>
          )}
          <button className="link-small" onClick={() => setConfirming('QUIT')}>
            Cancel game
          </button>
        </div>
      )}

      {confirming === 'BACK' && (
        <div className="confirm" role="alertdialog" aria-label="Confirm going back">
          <p>
            Go back one player? The previous player will see the pass-the-phone
            screen again and can look at their role once more.
          </p>
          <button className="btn btn--secondary" onClick={onGoBack}>
            Yes, go back
          </button>
          <button className="btn btn--ghost" onClick={() => setConfirming(null)}>
            Cancel
          </button>
        </div>
      )}

      {confirming === 'QUIT' && (
        <div className="confirm" role="alertdialog" aria-label="Confirm cancelling the game">
          <p>
            Cancel this game? All roles are thrown away, and a new game picks new
            roles.
          </p>
          <button className="btn btn--secondary" onClick={onQuit}>
            Yes, cancel game
          </button>
          <button className="btn btn--ghost" onClick={() => setConfirming(null)}>
            Keep playing
          </button>
        </div>
      )}
    </section>
  )
}
