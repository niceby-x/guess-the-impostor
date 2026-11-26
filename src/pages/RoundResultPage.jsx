import { useEffect, useRef } from 'react'
import Avatar from '../components/Avatar.jsx'
import Screen from '../components/Screen.jsx'
import StepTracker from '../components/StepTracker.jsx'
import { seatOf } from '../components/avatarSpec.js'
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
  const mostVotes = Math.max(1, ...result.counts.map((entry) => entry.count))
  const ready = useReadyAfter(800)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const isImpostor = eliminated?.role === 'IMPOSTOR'

  return (
    <Screen
      tone="table"
      hud={<StepTracker step="result" round={game.roundNumber} />}
      footer={
        <button className="btn btn--primary" onClick={onContinue} disabled={!ready}>
          Continue
        </button>
      }
    >
      <div className="verdict">
        {eliminated ? (
          <>
            <Avatar seat={seatOf(eliminated.id)} size="lg" masked={isImpostor} out={!isImpostor} />
            <h1 className="title focus-target" tabIndex={-1} ref={headingRef}>
              {eliminated.name} is out
            </h1>
            <p className={`role-tag ${isImpostor ? 'role-tag--impostor' : 'role-tag--regular'}`}>
              {isImpostor ? 'Impostor' : 'Regular player'}
            </p>
            {result.hadRevote && <p className="note">A tie was settled by a revote.</p>}
          </>
        ) : (
          <>
            <h1 className="title focus-target" tabIndex={-1} ref={headingRef}>
              Tied again: nobody is out
            </h1>
            <p className="lede">The revote was also tied, so nobody is eliminated this round.</p>
          </>
        )}
      </div>

      <h2 className="section-title">{result.hadRevote ? 'Revote totals' : 'Vote totals'}</h2>
      <ul className="tally">
        {result.counts.map(({ id, count }) => (
          <li key={id} className="tally__row">
            <Avatar seat={seatOf(id)} size="sm" />
            <div>
              <span className="tally__name">{nameOf(id)}</span>
              <div className="tally__track" aria-hidden="true">
                <div className="tally__fill" style={{ '--share': count / mostVotes }} />
              </div>
            </div>
            <span className="tally__count">{plural(count, 'vote', 'votes')}</span>
          </li>
        ))}
      </ul>

      <p className="note" role="status">
        Still in the game: {plural(regulars, 'regular player', 'regular players')} and{' '}
        {plural(impostors, 'impostor', 'impostors')}.
      </p>
    </Screen>
  )
}
