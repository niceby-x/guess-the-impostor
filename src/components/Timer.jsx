import useCountdown from '../hooks/useCountdown.js'
import { formatClock } from '../game/timer.js'

// Shows the remaining time and calls onExpire once at zero.
export default function Timer({ seconds, onExpire, label = 'Time left' }) {
  const remaining = useCountdown(seconds, onExpire)
  return (
    <p className={`timer${remaining <= 5 ? ' timer--low' : ''}`} role="timer">
      <span className="timer__label">{label}</span>
      <span className="timer__value">{formatClock(remaining)}</span>
    </p>
  )
}
