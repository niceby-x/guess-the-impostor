import { useState } from 'react'
import { MAX_PLAYERS, MIN_PLAYERS, validatePlayers } from '../game/validateSetup.js'

export default function PlayerSetupPage({ names, onChange, onBack, onNext }) {
  // Errors stay hidden until the host first taps Next, so the screen does not
  // shout at them while they are still typing. After that they update live.
  const [showErrors, setShowErrors] = useState(false)
  const result = validatePlayers(names)

  function updateName(index, value) {
    onChange(names.map((n, i) => (i === index ? value : n)))
  }
  function removeName(index) {
    onChange(names.filter((_, i) => i !== index))
  }
  function addName() {
    if (names.length < MAX_PLAYERS) onChange([...names, ''])
  }
  function handleNext() {
    if (result.valid) {
      onNext(result.names)
    } else {
      setShowErrors(true)
    }
  }

  return (
    <section className="screen">
      <button className="link-back" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Who is playing?</h2>
      <p className="subtle">
        Add {MIN_PLAYERS} to {MAX_PLAYERS} players ({names.length} so far). Names
        are 2 to 16 characters and must all be different.
      </p>

      {showErrors && result.errors.length > 0 && (
        <ul className="error-box" role="alert">
          {result.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <ul className="player-list">
        {names.map((name, index) => {
          const message = showErrors ? result.nameErrors[index] : undefined
          return (
            <li key={index} className="player-item">
              <div className="player-row">
                <label className="sr-only" htmlFor={`player-${index}`}>
                  Player {index + 1} name
                </label>
                <input
                  id={`player-${index}`}
                  className={`input${message ? ' input--invalid' : ''}`}
                  type="text"
                  maxLength={32}
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  aria-invalid={message ? 'true' : undefined}
                  aria-describedby={message ? `player-${index}-error` : undefined}
                  onChange={(e) => updateName(index, e.target.value)}
                />
                <button
                  className="btn btn--icon"
                  aria-label={`Remove player ${index + 1}`}
                  onClick={() => removeName(index)}
                >
                  &times;
                </button>
              </div>
              {message && (
                <p className="error-text" id={`player-${index}-error`}>
                  {message}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <button
        className="btn btn--secondary"
        onClick={addName}
        disabled={names.length >= MAX_PLAYERS}
      >
        + Add player
      </button>

      <button className="btn btn--primary" onClick={handleNext}>
        Next: Settings
      </button>
    </section>
  )
}
