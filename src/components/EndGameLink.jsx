import { useState } from 'react'

// "End game" with an inline confirmation, so one stray tap cannot throw away
// the match.
export default function EndGameLink({ onEnd }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button className="link-small" onClick={() => setConfirming(true)}>
        End game
      </button>
    )
  }
  return (
    <div className="confirm" role="alertdialog" aria-label="Confirm ending the game">
      <p>End this game? All roles and progress are thrown away.</p>
      <button className="btn btn--secondary" onClick={onEnd}>
        Yes, end game
      </button>
      <button className="btn btn--ghost" onClick={() => setConfirming(false)}>
        Keep playing
      </button>
    </div>
  )
}
