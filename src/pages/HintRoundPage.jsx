import { useEffect, useRef } from 'react'
import EndGameLink from '../components/EndGameLink.jsx'
import Timer from '../components/Timer.jsx'
import { getHintTurnView } from '../game/hintRound.js'
import useReadyAfter from '../hooks/useReadyAfter.js'

const STATUS_LABEL = { DONE: 'Done', SPEAKING: 'Speaking now', WAITING: 'Waiting' }

// One speaker's turn. App gives this page a new key for every turn, so the
// timer and the anti-double-tap delay restart automatically.
export default function HintRoundPage({ game, onNextSpeaker, onEnd }) {
  const view = getHintTurnView(game)
  const hintSeconds = game.settings.hintSeconds
  const ready = useReadyAfter(800)
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // The same call is used by the button and by the timer. It names the turn it
  // is for, so if both fire together only one speaker is finished.
  const finishTurn = () => onNextSpeaker(game.currentHintIndex)

  return (
    <section className="screen">
      <span className="status-chip">Round {view.roundNumber}</span>
      <p className="subtle">
        Speaker {view.position} of {view.total}
      </p>
      <h2 className="turn-name focus-target" tabIndex={-1} ref={headingRef}>
        {view.speakerName}, it is your turn
      </h2>
      <p className="notice">
        Say one short hint out loud. Do not say the secret word. Nothing is
        typed.
      </p>

      {hintSeconds > 0 && <Timer seconds={hintSeconds} onExpire={finishTurn} />}

      <button className="btn btn--primary" onClick={finishTurn} disabled={!ready}>
        {view.isLast ? 'Finish hints' : 'Next speaker'}
      </button>

      <h3 className="list-title">Speaking order</h3>
      <ol className="order-list">
        {view.entries.map((entry) => (
          <li key={entry.id} className={`order-item order-item--${entry.status.toLowerCase()}`}>
            <span>{entry.name}</span>
            <span className="order-item__status">{STATUS_LABEL[entry.status]}</span>
          </li>
        ))}
      </ol>

      <EndGameLink onEnd={onEnd} />
    </section>
  )
}
