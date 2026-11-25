import { useEffect, useRef } from 'react'
import EndGameLink from './EndGameLink.jsx'
import useReadyAfter from '../hooks/useReadyAfter.js'

// Neutral "pass the phone" screen between ballots. It knows only a name and
// progress. After a ballot it shows "Vote saved" and nothing about the choice.
export default function VoteHandoff({ voterName, position, total, justSaved, isRevote, onStart, onEnd }) {
  // Disabled for a moment so a fast double-tap on "Confirm vote" cannot open
  // the NEXT voter's ballot in front of the previous voter.
  const ready = useReadyAfter(700)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="screen screen--center handoff">
      {justSaved && <span className="status-chip status-chip--ok">Vote saved</span>}
      {isRevote && <span className="status-chip">Revote</span>}
      <p className="subtle">
        Voter {position} of {total}
      </p>
      <p className="handoff__lead">Pass the phone to</p>
      <h2 className="handoff__name focus-target" tabIndex={-1} ref={headingRef}>
        {voterName}
      </h2>
      <p className="subtle">Make sure nobody else is looking at the screen.</p>

      <button className="btn btn--primary" onClick={onStart} disabled={!ready}>
        Start my vote
      </button>

      <EndGameLink onEnd={onEnd} />
    </section>
  )
}
