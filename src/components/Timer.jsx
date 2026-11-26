import useCountdown from '../hooks/useCountdown.js'
import { formatClock } from '../game/timer.js'

// Remaining time as digits and a draining bar. Calls onExpire once at zero.
// The last five seconds turn coral; the digits still say the time, so colour is
// never the only signal.
export default function Timer({ seconds, onExpire, label = 'Time left' }) {
  const remaining = useCountdown(seconds, onExpire)
  return (
    <div className={`timer${remaining <= 5 ? ' timer--low' : ''}`} role="timer">
      <div className="timer__row">
        <span className="timer__label">{label}</span>
        <span className="timer__value">{formatClock(remaining)}</span>
      </div>
      <div className="timer__track" aria-hidden="true">
        <div className="timer__fill" style={{ width: `${(remaining / seconds) * 100}%` }} />
      </div>
    </div>
  )
}
