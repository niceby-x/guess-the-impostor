// One selectable choice on the private ballot. "Selected" is written out, so
// the choice is not shown by colour alone.
export default function VoteOption({ name, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`vote-option${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span>{name}</span>
      {selected && <span className="vote-option__tag">Selected</span>}
    </button>
  )
}
