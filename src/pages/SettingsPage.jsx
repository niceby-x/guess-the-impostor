import { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import Screen from '../components/Screen.jsx'
import { getImpostorRange } from '../game/validateSetup.js'

// "Start game" asks the app to create the match. createGame validates the whole
// setup again and returns any errors, which are shown here.
const HINT_OPTIONS = [0, 15, 30, 45, 60] // 0 = no hint timer (it is optional)
const DISCUSSION_OPTIONS = [30, 60, 90, 120]

function Choice({ label, active, onPick }) {
  return (
    <button className={`segmented__btn${active ? ' is-active' : ''}`} aria-pressed={active} onClick={onPick}>
      {label}
    </button>
  )
}

export default function SettingsPage({ names, settings, onSettingsChange, onBack, onStart }) {
  const playerCount = names.length
  const { min, max } = getImpostorRange(playerCount)
  const { hintSeconds, discussionSeconds } = settings
  const [errors, setErrors] = useState([])

  // Keep the choice inside the allowed range if the player count changed.
  const selectedImpostors = Math.min(Math.max(settings.impostorCount, min), Math.max(min, max))
  const impostorChoices = Array.from({ length: max }, (_, i) => i + 1)

  function update(change) {
    onSettingsChange({ ...settings, impostorCount: selectedImpostors, ...change })
  }

  function handleStart() {
    // Pass exactly what is shown on screen (including a clamped impostor count).
    const result = onStart({ impostorCount: selectedImpostors, hintSeconds, discussionSeconds })
    setErrors(result.ok ? [] : result.errors)
  }

  return (
    <Screen
      tone="table"
      hud={
        <button className="btn btn--back" onClick={onBack}>
          Back
        </button>
      }
      footer={
        <button className="btn btn--primary" onClick={handleStart}>
          Start game
        </button>
      }
    >
      <h1 className="title">Set the rules</h1>

      <div>
        <div className="faces-row" aria-hidden="true">
          {names.map((name, index) => (
            <Avatar key={index} seat={index} size="sm" />
          ))}
        </div>
        <p className="note">
          {playerCount} players: {names.join(', ')}
        </p>
      </div>

      <fieldset className="setting">
        <legend>Impostors</legend>
        <p className="note">
          For {playerCount} players you can have {min} to {max}.
        </p>
        {max < min ? (
          <p className="error-text">Go back and add at least 4 players.</p>
        ) : (
          <div className="segmented">
            {impostorChoices.map((n) => (
              <Choice key={n} label={n} active={selectedImpostors === n} onPick={() => update({ impostorCount: n })} />
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="setting">
        <legend>Hint timer</legend>
        <p className="note">How long each person gets to give their hint.</p>
        <div className="segmented">
          {HINT_OPTIONS.map((s) => (
            <Choice
              key={s}
              label={s === 0 ? 'Off' : `${s}s`}
              active={hintSeconds === s}
              onPick={() => update({ hintSeconds: s })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="setting">
        <legend>Discussion timer</legend>
        <p className="note">How long everyone talks before voting.</p>
        <div className="segmented">
          {DISCUSSION_OPTIONS.map((s) => (
            <Choice
              key={s}
              label={`${s}s`}
              active={discussionSeconds === s}
              onPick={() => update({ discussionSeconds: s })}
            />
          ))}
        </div>
      </fieldset>

      {errors.length > 0 && (
        <ul className="error-box" role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </Screen>
  )
}
