import { useEffect, useRef } from 'react'

// Shows ONE player's private role. It receives only that player's display
// object ({ role, word } or { role, clue }), never the whole game (guide 7.2).
// The role is shown as text AND colour, never colour alone.
export default function RoleRevealCard({ playerName, display, onHide }) {
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const isImpostor = display.role === 'IMPOSTOR'

  return (
    <section
      className={`screen role-card ${isImpostor ? 'role-card--impostor' : 'role-card--regular'}`}
    >
      <p className="subtle">Only {playerName} should be looking at this screen.</p>
      <span className={`badge ${isImpostor ? 'badge--impostor' : 'badge--regular'}`}>
        {isImpostor ? 'Impostor' : 'Regular player'}
      </span>

      <h2 className="role-card__label focus-target" tabIndex={-1} ref={headingRef}>
        {isImpostor ? 'Your clue is' : 'The secret word is'}
      </h2>
      <p className="role-card__secret">{isImpostor ? display.clue : display.word}</p>

      <p className="subtle">
        {isImpostor
          ? 'You do not know the word. Give hints that fit this clue and blend in.'
          : 'Give a hint about the word without saying it.'}
      </p>

      <button className="btn btn--primary" onClick={onHide}>
        Hide and pass
      </button>
    </section>
  )
}
