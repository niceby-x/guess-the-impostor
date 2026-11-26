import { useEffect, useRef } from 'react'
import Avatar from './Avatar.jsx'
import Screen from './Screen.jsx'

// ONE player's private role, on a BLACK screen: the signal that only the person
// holding the phone should look. It receives only that player's display object
// ({ role, word } or { role, clue }) and their seat, never the whole game
// (guide 7.2). The role is shown in words AND colour AND a disguise on the face.
export default function RoleRevealCard({ playerName, seat, display, onHide }) {
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const isImpostor = display.role === 'IMPOSTOR'

  return (
    <Screen
      tone="private"
      footer={
        <button className="btn btn--primary" onClick={onHide}>
          Hide and pass
        </button>
      }
    >
      <article className={`role-card ${isImpostor ? 'role-card--impostor' : 'role-card--regular'}`}>
        <Avatar seat={seat} size="lg" masked={isImpostor} />
        <p className="role-card__who">For {playerName} only</p>
        <h1 className="role-card__kicker focus-target" tabIndex={-1} ref={headingRef}>
          {isImpostor ? 'You are the impostor' : 'Your secret word is'}
        </h1>
        {isImpostor && <p className="role-card__label">Your clue is</p>}
        <p className="role-card__secret">{isImpostor ? display.clue : display.word}</p>
        <p className="role-card__hint">
          {isImpostor
            ? 'You do not know the word. Give hints that fit this clue and blend in.'
            : 'Give a hint about it without saying it. Watch out for someone bluffing.'}
        </p>
      </article>
    </Screen>
  )
}
