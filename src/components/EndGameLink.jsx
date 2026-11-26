import { useState } from 'react'

// "End game" with an inline confirmation, so one stray tap cannot throw away
// the match.
export default function EndGameLink({ onEnd }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button className="btn btn--quiet" onClick={() => setConfirming(true)}>
        End game
      </button>
    )
  }
  return (
    <div className="confirm" role="alertdialog" aria-label="Confirm ending the game">
      <p>End this game? All roles and progress are thrown away.</p>
      <button className="btn btn--paper" onClick={onEnd}>
        Yes, end game
      </button>
      <button className="btn btn--quiet" onClick={() => setConfirming(false)}>
        Keep playing
      </button>
    </div>
  )
}
