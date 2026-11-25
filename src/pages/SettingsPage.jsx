import { useState } from 'react'
import { getImpostorRange } from '../game/validateSetup.js'

// "Start game" asks the app to create the match. createGame validates the whole
// setup again and returns any errors, which are shown here.
const HINT_OPTIONS = [0, 15, 30, 45, 60] // 0 = no hint timer (it is optional)
const DISCUSSION_OPTIONS = [30, 60, 90, 120]

export default function SettingsPage({ names, settings, onSettingsChange, onBack, onStart }) {
  const playerCount = names.length
  const { min, max } = getImpostorRange(playerCount)
  const { hintSeconds, discussionSeconds } = settings
  const [errors, setErrors] = useState([])

  // Keep the choice inside the allowed range if the player count changed.
  const selectedImpostors = Math.min(Math.max(settings.impostorCount, min), Math.max(min, max))

  function update(change) {
    onSettingsChange({ ...settings, impostorCount: selectedImpostors, ...change })
  }
  const impostorChoices = Array.from({ length: max }, (_, i) => i + 1)

  function handleStart() {
    // Pass exactly what is shown on screen (including a clamped impostor count).
    const result = onStart({ impostorCount: selectedImpostors, hintSeconds, discussionSeconds })
    setErrors(result.ok ? [] : result.errors)
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
                onClick={() => update({ impostorCount: n })}
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
              onClick={() => update({ hintSeconds: s })}
            >
              {s === 0 ? 'Off' : `${s}s`}
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
              onClick={() => update({ discussionSeconds: s })}
            >
              {s}s
            </button>
          ))}
        </div>
      </fieldset>

      <button className="btn btn--primary" onClick={handleStart}>
        Start game
      </button>

      {errors.length > 0 && (
        <ul className="error-box" role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
