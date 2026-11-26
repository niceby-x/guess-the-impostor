import { useEffect, useRef } from 'react'
import Avatar from '../components/Avatar.jsx'
import EndGameLink from '../components/EndGameLink.jsx'
import Screen from '../components/Screen.jsx'
import StepTracker from '../components/StepTracker.jsx'
import Timer from '../components/Timer.jsx'
import { seatOf } from '../components/avatarSpec.js'
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
    <Screen
      tone="table"
      hud={<StepTracker step="talk" round={game.roundNumber} />}
      footer={
        <>
          <button className="btn btn--primary" onClick={onFinish} disabled={!ready}>
            Start voting now
          </button>
          <EndGameLink onEnd={onEnd} />
        </>
      }
    >
      <h1 className="title focus-target" tabIndex={-1} ref={headingRef}>
        Talk it out
      </h1>
      <p className="lede">
        Everyone has given a hint. Whose was vague, too specific, or just strange? Voting comes next.
      </p>

      <Timer seconds={game.settings.discussionSeconds} onExpire={onFinish} label="Voting starts in" />

      <h2 className="section-title">Still in the game</h2>
      <ul className="crowd">
        {getActivePlayers(game).map((player) => (
          <li key={player.id} className="crowd__item">
            <Avatar seat={seatOf(player.id)} size="md" />
            <span>{player.name}</span>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
