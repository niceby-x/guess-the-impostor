import Avatar from './Avatar.jsx'
import { seatOf } from './avatarSpec.js'

// One suspect on the private ballot. "Your pick" is written out, so the choice
// is never shown by colour alone.
export default function VoteOption({ id, name, selected, onSelect }) {
  return (
    <button type="button" className={`placard${selected ? ' is-picked' : ''}`} aria-pressed={selected} onClick={onSelect}>
      <Avatar seat={seatOf(id)} size="md" />
      <span>{name}</span>
      <span className="placard__tag">{selected ? 'Your pick' : ''}</span>
    </button>
  )
}
