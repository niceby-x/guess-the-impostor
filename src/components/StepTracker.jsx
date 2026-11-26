// Where the table is in the round. This is a real sequence, so steps are the
// right way to show it. Round 1 starts with Roles; later rounds skip it.
const ALL_STEPS = [
  { id: 'roles', label: 'Roles' },
  { id: 'hints', label: 'Hints' },
  { id: 'talk', label: 'Talk' },
  { id: 'vote', label: 'Vote' },
  { id: 'result', label: 'Result' },
]

export default function StepTracker({ step, round }) {
  const steps = round > 1 ? ALL_STEPS.filter((s) => s.id !== 'roles') : ALL_STEPS
  const currentIndex = steps.findIndex((s) => s.id === step)

  return (
    <>
      <p className="hud__round">Round {round}</p>
      <ol className="steps" aria-label="Where we are in this round">
        {steps.map((s, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return (
            <li
              key={s.id}
              className={`steps__item steps__item--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="steps__bar" aria-hidden="true" />
              <span className="steps__label">
                {s.label}
                {state === 'done' && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </>
  )
}
