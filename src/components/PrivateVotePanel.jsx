import { useEffect, useRef, useState } from 'react'
import VoteOption from './VoteOption.jsx'

// ONE voter's private ballot. It receives only the voter's name and the
// allowed targets as { id, name }: no roles and no other votes. The chosen
// player lives only in this component's state; once the vote is confirmed the
// next screen replaces this panel, so the choice is never shown again.
export default function PrivateVotePanel({ voterName, targets, onConfirm }) {
  const [selectedId, setSelectedId] = useState(null)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="screen">
      <p className="subtle">Only {voterName} should be looking at this screen.</p>
      <h2 className="focus-target" tabIndex={-1} ref={headingRef}>
        {voterName}, who do you think is an impostor?
      </h2>

      <div className="vote-list" role="group" aria-label="Choose a player">
        {targets.map((target) => (
          <VoteOption
            key={target.id}
            name={target.name}
            selected={selectedId === target.id}
            onSelect={() => setSelectedId(target.id)}
          />
        ))}
      </div>

      <button
        className="btn btn--primary"
        disabled={selectedId === null}
        onClick={() => onConfirm(selectedId)}
      >
        Confirm vote
      </button>
    </section>
  )
}
