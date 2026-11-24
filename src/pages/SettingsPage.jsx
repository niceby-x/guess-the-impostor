import { useState } from 'react'
import { getImpostorRange, validateSetup } from '../game/validateSetup.js'

// "Start game" now validates the whole setup. Roles and the word bank arrive
// in Milestone 3, so a valid setup only shows a confirmation for now.
const HINT_OPTIONS = [15, 30, 45, 60]
const DISCUSSION_OPTIONS = [30, 60, 90, 120]

export default function SettingsPage({ names, onBack }) {
  const playerCount = names.length
  const { min, max } = getImpostorRange(playerCount)
  const [impostors, setImpostors] = useState(min)
  const [hintSeconds, setHintSeconds] = useState(30)
  const [discussionSeconds, setDiscussionSeconds] = useState(60)
  const [result, setResult] = useState(null)

  // Keep the choice inside the allowed range if the player count changed.
  const selectedImpostors = Math.min(Math.max(impostors, min), Math.max(min, max))
  const impostorChoices = Array.from({ length: max }, (_, i) => i + 1)

  function handleStart() {
    // Validate again right before starting, as the guide requires.
    const check = validateSetup(names, selectedImpostors)
    setResult(
      check.valid
        ? {
            ok: true,
            message: `Setup is valid: ${playerCount} players, ${selectedImpostors} impostor${selectedImpostors > 1 ? 's' : ''}, ${hintSeconds}s hints, ${discussionSeconds}s discussion. Word and role assignment arrive in Milestone 3.`,
          }
        : { ok: false, errors: check.errors },
    )
  }

  return (
    <section className="screen">
      <button className="link-back" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Game settings</h2>

      <fieldset className="field">
        <legend>Impostors</legend>
        <p className="subtle">
          Allowed for {playerCount} players: {min} to {max}.
        </p>
        {max < min ? (
          <p className="error-text">Go back and add at least 4 players.</p>
        ) : (
          <div className="segmented">
            {impostorChoices.map((n) => (
              <button
                key={n}
                className={`segmented__btn${selectedImpostors === n ? ' is-active' : ''}`}
                aria-pressed={selectedImpostors === n}
                onClick={() => setImpostors(n)}
              >
                {n}
              </button>
            ))}
          </div>
        )}
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

      <button className="btn btn--primary" onClick={handleStart}>
        Start game
      </button>

      {result?.ok && (
        <p className="notice" role="status">
          {result.message}
        </p>
      )}
      {result && !result.ok && (
        <ul className="error-box" role="alert">
          {result.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
