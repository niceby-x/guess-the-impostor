import { useEffect, useRef } from 'react'
import Avatar from '../components/Avatar.jsx'
import Screen from '../components/Screen.jsx'
import { seatOf } from '../components/avatarSpec.js'
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
  // The winning team's survivors take a bow above the headline.
  const winningRole = reveal.winner === 'IMPOSTORS' ? 'IMPOSTOR' : 'REGULAR'
  const victors = reveal.players.filter((player) => player.role === winningRole && !player.isEliminated)
  // The buttons wake up a moment late, so a double-tap on the previous
  // screen's Continue cannot start a new match by accident.
  const ready = useReadyAfter(800)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <Screen
      tone="table"
      footerFlow
      footer={
        <>
          <button className="btn btn--primary" onClick={onPlayAgain} disabled={!ready}>
            Play again
          </button>
          <button className="btn btn--paper" onClick={onChangeSettings} disabled={!ready}>
            Change players or settings
          </button>
          <button className="btn btn--quiet" onClick={onHome} disabled={!ready}>
            Home
          </button>
        </>
      }
    >
      <div className="victors" aria-hidden="true">
        {victors.map((player) => (
          <Avatar key={player.id} seat={seatOf(player.id)} size="md" masked={reveal.winner === 'IMPOSTORS'} />
        ))}
      </div>
      <h1 className="title focus-target" tabIndex={-1} ref={headingRef}>
        {text.title}
      </h1>
      <p className="lede">
        {text.reason} The match lasted {reveal.roundsPlayed} {reveal.roundsPlayed === 1 ? 'round' : 'rounds'}.
      </p>

      <h2 className="section-title">The secret</h2>
      <dl className="secret-pair">
        <div className="tile">
          <dt className="tile__label">Regular players had the word</dt>
          <dd className="tile__value">{reveal.secretWord}</dd>
        </div>
        <div className="tile tile--clue">
          <dt className="tile__label">Impostors had the clue</dt>
          <dd className="tile__value">{reveal.impostorClue}</dd>
        </div>
      </dl>

      <h2 className="section-title">Everyone&rsquo;s role</h2>
      <ul className="order">
        {reveal.players.map((player) => {
          const isImpostor = player.role === 'IMPOSTOR'
          return (
            <li key={player.id} className="order__row">
              <Avatar seat={seatOf(player.id)} size="sm" masked={isImpostor} out={player.isEliminated && !isImpostor} />
              <span className="order__name">{player.name}</span>
              <span className="order__tags">
                <span className={`role-tag ${isImpostor ? 'role-tag--impostor' : 'role-tag--regular'}`}>
                  {isImpostor ? 'Impostor' : 'Regular player'}
                </span>
                <span className="status-tag">{player.isEliminated ? 'Out' : 'Still in'}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
