import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar.jsx'
import Screen from './Screen.jsx'
import StepTracker from './StepTracker.jsx'
import useReadyAfter from '../hooks/useReadyAfter.js'

// The Reveal button stays disabled for a moment after this screen appears, so a
// fast double-tap on "Hide and pass" cannot reveal the NEXT player's role to
// the player who just finished.
const READY_DELAY_MS = 600

// Neutral table screen: a face-down card with the player's face on the back. It
// receives a name, a seat and progress and NOTHING else, so it has no way to
// show a word, clue or role (guide sections 3.1 and 4.1).
export default function HandoffScreen({
  playerName,
  seat,
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
    <Screen
      tone="table"
      center
      hud={<StepTracker step="roles" round={1} />}
      footer={
        <>
          <button className="btn btn--primary" onClick={onReveal} disabled={!ready}>
            Reveal my role
          </button>
          {confirming === null && (
            <div className="extras">
              {canGoBack && (
                <button className="btn btn--quiet" onClick={() => setConfirming('BACK')}>
                  Go back one player
                </button>
              )}
              <button className="btn btn--quiet" onClick={() => setConfirming('QUIT')}>
                Cancel game
              </button>
            </div>
          )}
        </>
      }
    >
      <div className="deal">
        <p className="deal__lead">Pass the phone to</p>
        <h1 className="deal__name focus-target" tabIndex={-1} ref={headingRef}>
          {playerName}
        </h1>
        <div className="card-back" aria-hidden="true">
          <div className="card-back__seal">
            <Avatar seat={seat} />
          </div>
        </div>
        <p className="note">
          Player {position} of {total}. Hold the phone close so nobody else can see.
        </p>
        <div className="progress-dots" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < position - 1 ? 'is-done' : i === position - 1 ? 'is-current' : ''} />
          ))}
        </div>
      </div>

      {confirming === 'BACK' && (
        <div className="confirm" role="alertdialog" aria-label="Confirm going back">
          <p>
            Go back one player? The previous player will see the pass-the-phone screen again and can
            look at their role once more.
          </p>
          <button className="btn btn--paper" onClick={onGoBack}>
            Yes, go back
          </button>
          <button className="btn btn--quiet" onClick={() => setConfirming(null)}>
            Cancel
          </button>
        </div>
      )}

      {confirming === 'QUIT' && (
        <div className="confirm" role="alertdialog" aria-label="Confirm cancelling the game">
          <p>Cancel this game? All roles are thrown away, and a new game picks new roles.</p>
          <button className="btn btn--paper" onClick={onQuit}>
            Yes, cancel game
          </button>
          <button className="btn btn--quiet" onClick={() => setConfirming(null)}>
            Keep playing
          </button>
        </div>
      )}
    </Screen>
  )
}
