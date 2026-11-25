import { useEffect, useRef } from 'react'
import { getFinalReveal } from '../game/finalReveal.js'
import useReadyAfter from '../hooks/useReadyAfter.js'

const WINNER_TEXT = {
  REGULAR_PLAYERS: {
    title: 'The regular players win',
    reason: 'Every impostor has been voted out.',
  },
  IMPOSTORS: {
    title: 'The impostors win',
    reason: 'The impostors now equal or outnumber the regular players.',
  },
}

// The end of a match. This is the ONLY screen that shows every role, the
// secret word and the impostor clue; getFinalReveal refuses to run before the
// game is over. The category is never shown.
export default function GameOverPage({ game, onPlayAgain, onChangeSettings, onHome }) {
  const reveal = getFinalReveal(game)
  const text = WINNER_TEXT[reveal.winner]
  // The buttons wake up a moment late, so a double-tap on the previous
  // screen's Continue cannot start a new match by accident.
  const ready = useReadyAfter(800)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="screen">
      <span className="status-chip">Game over</span>
      <h2 className="focus-target" tabIndex={-1} ref={headingRef}>
        {text.title}
      </h2>
      <p className="notice" role="status">
        {text.reason} The match lasted {reveal.roundsPlayed} {reveal.roundsPlayed === 1 ? 'round' : 'rounds'}.
      </p>

      <h3 className="list-title">The secret</h3>
      <dl className="secret-reveal">
        <div>
          <dt>Regular players had the word</dt>
          <dd>{reveal.secretWord}</dd>
        </div>
        <div>
          <dt>Impostors had the clue</dt>
          <dd>{reveal.impostorClue}</dd>
        </div>
      </dl>

      <h3 className="list-title">Everyone&rsquo;s role</h3>
      <ul className="order-list">
        {reveal.players.map((player) => (
          <li
            key={player.id}
            className={`order-item ${player.role === 'IMPOSTOR' ? 'order-item--impostor' : 'order-item--regular'}`}
          >
            <span>{player.name}</span>
            <span className="order-item__status">
              {player.role === 'IMPOSTOR' ? 'Impostor' : 'Regular player'}
              {' \u00b7 '}
              {player.isEliminated ? 'Out' : 'Still in'}
            </span>
          </li>
        ))}
      </ul>

      <button className="btn btn--primary" onClick={onPlayAgain} disabled={!ready}>
        Play again
      </button>
      <p className="hint-text">Same players and settings, new roles and a new word.</p>
      <button className="btn btn--secondary" onClick={onChangeSettings} disabled={!ready}>
        Change players or settings
      </button>
      <button className="btn btn--ghost" onClick={onHome} disabled={!ready}>
        Home
      </button>
    </section>
  )
}
