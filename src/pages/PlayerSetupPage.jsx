// Milestone 1: visual prototype only.
// Names can be added, edited and removed, but real validation
// (4-12 players, unique names) arrives in Milestone 2.
const MAX_PLAYERS = 12

export default function PlayerSetupPage({ names, onChange, onBack, onNext }) {
  function updateName(index, value) {
    onChange(names.map((n, i) => (i === index ? value : n)))
  }
  function removeName(index) {
    onChange(names.filter((_, i) => i !== index))
  }
  function addName() {
    if (names.length < MAX_PLAYERS) onChange([...names, ''])
  }

  return (
    <section className="screen">
      <button className="link-back" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Who is playing?</h2>
      <p className="subtle">Add 4 to 12 players ({names.length} so far).</p>

      <ul className="player-list">
        {names.map((name, index) => (
          <li key={index} className="player-row">
            <label className="sr-only" htmlFor={`player-${index}`}>
              Player {index + 1} name
            </label>
            <input
              id={`player-${index}`}
              className="input"
              type="text"
              maxLength={16}
              placeholder={`Player ${index + 1}`}
              value={name}
              onChange={(e) => updateName(index, e.target.value)}
            />
            <button
              className="btn btn--icon"
              aria-label={`Remove player ${index + 1}`}
              onClick={() => removeName(index)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <button
        className="btn btn--secondary"
        onClick={addName}
        disabled={names.length >= MAX_PLAYERS}
      >
        + Add player
      </button>

      <button className="btn btn--primary" onClick={onNext}>
        Next: Settings
      </button>
    </section>
  )
}
