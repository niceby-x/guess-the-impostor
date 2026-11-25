import { useEffect, useRef } from 'react'
import EndGameLink from '../components/EndGameLink.jsx'
import Timer from '../components/Timer.jsx'
import { getActivePlayers } from '../game/hintRound.js'
import useReadyAfter from '../hooks/useReadyAfter.js'

// Everyone talks. The timer ends it automatically, or the host can continue
// early. Either way the game moves on to voting (guide section 7.3).
export default function DiscussionPage({ game, onFinish, onEnd }) {
  const ready = useReadyAfter(800)
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="screen">
      <span className="status-chip">Round {game.roundNumber}</span>
      <h2 className="focus-target" tabIndex={-1} ref={headingRef}>
        Discussion
      </h2>
      <p className="notice">
        Everyone has given a hint. Talk it over: whose hint was vague, too
        specific, or strange? Voting comes next.
      </p>

      <Timer seconds={game.settings.discussionSeconds} onExpire={onFinish} label="Discussion ends in" />

      <button className="btn btn--primary" onClick={onFinish} disabled={!ready}>
        Start voting now
      </button>

      <h3 className="list-title">Players in the game</h3>
      <ul className="order-list">
        {getActivePlayers(game).map((player) => (
          <li key={player.id} className="order-item">
            <span>{player.name}</span>
          </li>
        ))}
      </ul>

      <EndGameLink onEnd={onEnd} />
    </section>
  )
}
