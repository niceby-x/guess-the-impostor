import { useEffect, useRef, useState } from 'react'
import Screen from './Screen.jsx'
import VoteOption from './VoteOption.jsx'

// ONE voter's private ballot, on a BLACK screen. It receives only the voter's
// name and the allowed targets as { id, name }: no roles and no other votes.
// The chosen player lives only in this component's state; once the vote is
// confirmed the next screen replaces this panel, so the choice is never shown
// again.
export default function PrivateVotePanel({ voterName, targets, onConfirm }) {
  const [selectedId, setSelectedId] = useState(null)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <Screen
      tone="private"
      footer={
        <button className="btn btn--primary" disabled={selectedId === null} onClick={() => onConfirm(selectedId)}>
          Confirm vote
        </button>
      }
    >
      <p className="note">Only {voterName} should be looking at this screen.</p>
      <h1 className="title focus-target" tabIndex={-1} ref={headingRef}>
        {voterName}, who do you think is an impostor?
      </h1>

      <div className="placards" role="group" aria-label="Choose a player">
        {targets.map((target) => (
          <VoteOption
            key={target.id}
            id={target.id}
            name={target.name}
            selected={selectedId === target.id}
            onSelect={() => setSelectedId(target.id)}
          />
        ))}
      </div>
    </Screen>
  )
}
