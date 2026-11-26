import { useEffect, useRef } from 'react'
import Avatar from '../components/Avatar.jsx'
import EndGameLink from '../components/EndGameLink.jsx'
import Screen from '../components/Screen.jsx'
import StepTracker from '../components/StepTracker.jsx'
import Timer from '../components/Timer.jsx'
import { getHintTurnView } from '../game/hintRound.js'
import { seatOf } from '../components/avatarSpec.js'
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
    <Screen
      tone="table"
      hud={<StepTracker step="hints" round={view.roundNumber} />}
      footer={
        <>
          <button className="btn btn--primary" onClick={finishTurn} disabled={!ready}>
            {view.isLast ? 'Finish hints' : 'Next speaker'}
          </button>
          <EndGameLink onEnd={onEnd} />
        </>
      }
    >
      <div className="speaker">
        <Avatar seat={seatOf(view.speakerId)} size="lg" />
        <p className="note">
          Speaker {view.position} of {view.total}
        </p>
        <h1 className="title focus-target" tabIndex={-1} ref={headingRef}>
          {view.speakerName}, you&rsquo;re up
        </h1>
        <p className="lede">Say one short hint out loud. Do not say the secret word.</p>
      </div>

      {hintSeconds > 0 && <Timer seconds={hintSeconds} onExpire={finishTurn} />}

      <ol className="order" aria-label="Speaking order">
        {view.entries.map((entry) => (
          <li key={entry.id} className={`order__row order__row--${entry.status.toLowerCase()}`}>
            <Avatar seat={seatOf(entry.id)} size="sm" />
            <span className="order__name">{entry.name}</span>
            <span className="order__status">{STATUS_LABEL[entry.status]}</span>
          </li>
        ))}
      </ol>
    </Screen>
  )
}
