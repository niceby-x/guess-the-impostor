import { useEffect, useRef } from 'react'
import { getTeamCounts } from '../game/checkWinner.js'
import useReadyAfter from '../hooks/useReadyAfter.js'

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

// The outcome of a vote. Shows who is out and their ROLE (never the secret
// word or clue; those are saved for the end of the match), the vote totals, and
// how many of each team are left. It never shows who voted for whom.
export default function RoundResultPage({ game, onContinue }) {
  const result = game.roundResult
  const eliminated = game.players.find((player) => player.id === result.eliminatedId)
  const nameOf = (id) => game.players.find((player) => player.id === id).name
  const { impostors, regulars } = getTeamCounts(game)
  const ready = useReadyAfter(800)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="screen">
      <span className="status-chip">Round {game.roundNumber} result</span>

      {eliminated ? (
        <>
          <h2 className="focus-target" tabIndex={-1} ref={headingRef}>
            {eliminated.name} is out
          </h2>
          <p
            className={`role-reveal ${eliminated.role === 'IMPOSTOR' ? 'role-reveal--impostor' : 'role-reveal--regular'}`}
          >
            <span className={`badge ${eliminated.role === 'IMPOSTOR' ? 'badge--impostor' : 'badge--regular'}`}>
              {eliminated.role === 'IMPOSTOR' ? 'Impostor' : 'Regular player'}
            </span>
            <span>
              {eliminated.name} was {eliminated.role === 'IMPOSTOR' ? 'an impostor' : 'a regular player'}.
            </span>
          </p>
        </>
      ) : (
        <>
          <h2 className="focus-target" tabIndex={-1} ref={headingRef}>
            Tied again: nobody is out
          </h2>
          <p className="notice">The revote was also tied, so nobody is eliminated this round.</p>
        </>
      )}

      {result.hadRevote && eliminated && (
        <p className="subtle">A tie was settled by a revote.</p>
      )}

      <h3 className="list-title">{result.hadRevote ? 'Revote totals' : 'Vote totals'}</h3>
      <ul className="order-list">
        {result.counts.map(({ id, count }) => (
          <li key={id} className="order-item">
            <span>{nameOf(id)}</span>
            <span className="order-item__status">{plural(count, 'vote', 'votes')}</span>
          </li>
        ))}
      </ul>

      <p className="notice" role="status">
        Still in the game: {plural(regulars, 'regular player', 'regular players')} and{' '}
        {plural(impostors, 'impostor', 'impostors')}.
      </p>

      <button className="btn btn--primary" onClick={onContinue} disabled={!ready}>
        Continue
      </button>
    </section>
  )
}
