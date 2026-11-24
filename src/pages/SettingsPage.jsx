import { useState } from 'react'

// Milestone 1: visual prototype only. The allowed impostor range is shown
// using the guide's formula floor((players - 1) / 2), but nothing is
// validated and "Start game" does nothing yet (Milestones 2 and 3).
const HINT_OPTIONS = [15, 30, 45, 60]
const DISCUSSION_OPTIONS = [30, 60, 90, 120]

export default function SettingsPage({ playerCount, onBack }) {
  const maxImpostors = Math.max(1, Math.floor((playerCount - 1) / 2))
  const [impostors, setImpostors] = useState(1)
  const [hintSeconds, setHintSeconds] = useState(30)
  const [discussionSeconds, setDiscussionSeconds] = useState(60)
  const [notice, setNotice] = useState('')

  const impostorChoices = Array.from({ length: maxImpostors }, (_, i) => i + 1)

  return (
    <section className="screen">
      <button className="link-back" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Game settings</h2>

      <fieldset className="field">
        <legend>Impostors</legend>
        <p className="subtle">
          Allowed for {playerCount} players: 1 to {maxImpostors}.
        </p>
        <div className="segmented">
          {impostorChoices.map((n) => (
            <button
              key={n}
              className={`segmented__btn${impostors === n ? ' is-active' : ''}`}
              aria-pressed={impostors === n}
              onClick={() => setImpostors(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Hint timer (per player)</legend>
        <div className="segmented">
          {HINT_OPTIONS.map((s) => (
            <button
              key={s}
              className={`segmented__btn${hintSeconds === s ? ' is-active' : ''}`}
              aria-pressed={hintSeconds === s}
              onClick={() => setHintSeconds(s)}
            >
              {s}s
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Discussion timer</legend>
        <div className="segmented">
          {DISCUSSION_OPTIONS.map((s) => (
            <button
              key={s}
              className={`segmented__btn${discussionSeconds === s ? ' is-active' : ''}`}
              aria-pressed={discussionSeconds === s}
              onClick={() => setDiscussionSeconds(s)}
            >
              {s}s
            </button>
          ))}
        </div>
      </fieldset>

      <button
        className="btn btn--primary"
        onClick={() => setNotice('Game logic arrives in the next milestones.')}
      >
        Start game
      </button>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
    </section>
  )
}
