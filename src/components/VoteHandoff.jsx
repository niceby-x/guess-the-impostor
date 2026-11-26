import { useEffect, useRef } from 'react'
import Avatar from './Avatar.jsx'
import EndGameLink from './EndGameLink.jsx'
import Screen from './Screen.jsx'
import StepTracker from './StepTracker.jsx'
import useReadyAfter from '../hooks/useReadyAfter.js'

// Neutral table screen between ballots. It knows only a name, a seat and
// progress. After a ballot it stamps "Vote saved" and shows nothing about the
// choice.
export default function VoteHandoff({ voterName, seat, round, position, total, justSaved, isRevote, onStart, onEnd }) {
  // Disabled for a moment so a fast double-tap on "Confirm vote" cannot open
  // the NEXT voter's ballot in front of the previous voter.
  const ready = useReadyAfter(700)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <Screen
      tone="table"
      center
      hud={<StepTracker step="vote" round={round} />}
      footer={
        <>
          <button className="btn btn--primary" onClick={onStart} disabled={!ready}>
            Start my vote
          </button>
          <EndGameLink onEnd={onEnd} />
        </>
      }
    >
      <div className="deal">
        {justSaved && <p className="stamp">Vote saved</p>}
        {isRevote && <p className="note">Revote: you can only pick one of the tied players.</p>}
        <p className="deal__lead">Pass the phone to</p>
        <h1 className="deal__name focus-target" tabIndex={-1} ref={headingRef}>
          {voterName}
        </h1>
        <Avatar seat={seat} size="xl" />
        <p className="note">
          Voter {position} of {total}. Hold the phone close so nobody else can see.
        </p>
      </div>
    </Screen>
  )
}
